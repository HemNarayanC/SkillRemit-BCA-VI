import axios from "axios";
import { Job, Employer, JobApplication, JobSeeker, User } from "../models/index.js";
import HiringTransaction from "../models/HiringTransaction.js";
import { Op } from "sequelize";

// ─── Constants ────────────────────────────────────────────────────────────────
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_BASE_URL = process.env.KHALTI_BASE_URL; // https://dev.khalti.com/api/v2/epayment

const HIRING_FEE_PAISA = parseInt(process.env.HIRING_FEE_NPR ?? "500", 10) * 100;
const HIRING_FEE_PREMIUM_PAISA = parseInt(process.env.HIRING_FEE_PREMIUM_NPR ?? "350", 10) * 100;

// ─── INTERNAL: Khalti initiate ────────────────────────────────────────────────
// Mirrors _khaltiInitiate() in premium_controller.js
const _khaltiInitiate = async ({ employer, application, job, amount_paisa = HIRING_FEE_PAISA }) => {
    const purchase_order_id = `HIRE-${application.application_id}-${employer.employer_id}-${Date.now()}`;
    const candidateName = application.JobSeeker?.User?.name || "Candidate";
    const candidatePhone = application.JobSeeker?.User?.phone || "9800000000";
    const candidateEmail = application.JobSeeker?.User?.email || "candidate@example.com";

    const payload = {
        return_url: `${process.env.FRONTEND_URL}${process.env.KHALTI_RETURN_URL}?type=hiring`,
        website_url: process.env.KHALTI_WEBSITE_URL || "http://localhost:5173",
        amount: amount_paisa,
        purchase_order_id,
        purchase_order_name: `Hiring Fee — ${job.title}`,
        customer_info: {
            name: employer.company_name || "Employer",
            email: candidateEmail,
            phone: candidatePhone,
        },
        product_details: [{
            identity: purchase_order_id,
            name: `Hiring Fee — ${job.title}`,
            total_price: amount_paisa,
            quantity: 1,
            unit_price: amount_paisa,
        }],
    };

    const { data } = await axios.post(`${KHALTI_BASE_URL}/initiate/`, payload, {
        headers: {
            Authorization: `Key ${KHALTI_SECRET_KEY}`,
            "Content-Type": "application/json",
        },
    });

    // NOTE: application status is NOT changed to "hired" here.
    // It is changed only after payment verification in _khaltiVerify().
    const txn = await HiringTransaction.create({
        application_id: application.application_id,
        job_id: job.job_id,
        employer_id: employer.employer_id,
        jobseeker_id: application.jobseeker_id,
        fee_paisa: amount_paisa,
        was_premium: false,
        status: "initiated",
        pidx: data.pidx,
        purchase_order_id,
        khalti_customer: {
            name: employer.company_name,
            email: candidateEmail,
            phone: candidatePhone,
        },
        hired_at: new Date(),
    });

    return {
        pidx: data.pidx,
        payment_url: data.payment_url,
        hiring_txn_id: txn.hiring_txn_id,
    };
};

// ─── INTERNAL: Khalti verify ──────────────────────────────────────────────────
// FIX: Khalti returns "Completed" (capital C). Normalize with .toLowerCase() before comparing.
const _khaltiVerify = async (pidx) => {
    const { data } = await axios.post(
        `${KHALTI_BASE_URL}/lookup/`,
        { pidx },
        { headers: { Authorization: `Key ${KHALTI_SECRET_KEY}` } }
    );

    // ✅ FIX: Khalti returns "Completed" not "completed" — normalize before comparing
    const khaltiStatus = (data.status || "").toLowerCase();
    if (khaltiStatus !== "completed") {
        throw new Error(`Khalti payment not completed. Status: ${data.status}`);
    }

    const txn = await HiringTransaction.findOne({ where: { pidx } });
    if (!txn) throw new Error(`No HiringTransaction found for pidx: ${pidx}`);

    // Prevent double-processing
    if (txn.status === "completed") {
        return txn; // already verified, return early
    }

    await txn.update({
        status: "completed",
        paid_at: new Date(),
        khalti_response: data,
    });

    // ✅ FIX: Mark application as "hired" ONLY after payment is verified
    const application = await JobApplication.findByPk(txn.application_id);
    if (application) {
        await application.update({ status: "hired" });
    }

    return txn;
};

// ─── POST /hiring/:application_id/initiate ────────────────────────────────────
// Does NOT mark application as hired yet — that happens in verify.
const initiateHiringPayment = async (req, res) => {
    try {
        const { application_id } = req.params;

        const employer = await Employer.findOne({ where: { user_id: req.user.user_id } });
        if (!employer) return res.status(404).json({ message: "Employer profile not found" });

        const application = await JobApplication.findOne({
            where: { application_id },
            include: [
                { model: Job, where: { employer_id: employer.employer_id } },
                { model: JobSeeker, include: [{ model: User, attributes: ["name", "email", "phone"] }] },
            ],
        });
        if (!application) return res.status(404).json({ message: "Application not found or unauthorized" });
        if (application.status === "hired") return res.status(400).json({ message: "Candidate is already hired" });

        // Check for duplicate completed transaction
        const existing = await HiringTransaction.findOne({ where: { application_id } });
        if (existing && ["initiated", "completed"].includes(existing.status)) {
            return res.status(400).json({ message: "A hiring transaction already exists for this application" });
        }

        const isPremium = employer.is_premium || false;

        // ── Both premium & free-tier pay via Khalti ─────────────────────────
        // Premium: NPR 350 (discounted). Free-tier: NPR 500 (full rate).
        // Application status is set to "hired" ONLY after payment is verified.
        const feeForThisHire = isPremium ? HIRING_FEE_PREMIUM_PAISA : HIRING_FEE_PAISA;

        const result = await _khaltiInitiate({
            employer,
            application,
            job: application.Job,
            amount_paisa: feeForThisHire,
        });

        return res.status(200).json({
            message: isPremium
                ? "Premium rate applied. Redirect to payment_url to complete the NPR 350 hiring fee."
                : "Redirect employer to payment_url to complete the NPR 500 hiring fee.",
            hired: false, // set to true in verifyHiringPayment after Khalti confirms
            fee_waived: false,
            is_premium: isPremium,
            fee_npr: feeForThisHire / 100,
            pidx: result.pidx,
            payment_url: result.payment_url,
        });
    } catch (err) {
        console.error("initiateHiringPayment error:", err.response?.data || err.message);
        return res.status(500).json({ message: "Failed to initiate hiring payment" });
    }
};

// ─── GET /hiring/verify?pidx=XXX ─────────────────────────────────────────────
const verifyHiringPayment = async (req, res) => {
    try {
        const { pidx } = req.query;
        if (!pidx) return res.status(400).json({ message: "pidx query parameter is required" });

        const txn = await _khaltiVerify(pidx);

        return res.status(200).json({
            message: "Hiring fee payment verified!",
            hired: true,
            fee_paid: true,
            fee_npr: txn.fee_paisa / 100,
            transaction_id: txn.hiring_txn_id,
            paid_at: txn.paid_at,
            job_id: txn.job_id,
            employer_id: txn.employer_id,
        });
    } catch (err) {
        console.error("verifyHiringPayment error:", err.message);
        return res.status(400).json({ message: err.message || "Payment verification failed" });
    }
};

// ─── GET /hiring/my-fees ──────────────────────────────────────────────────────
// Employer's own hiring fee transaction history
const getMyHiringFees = async (req, res) => {
    try {
        const employer = await Employer.findOne({ where: { user_id: req.user.user_id } });
        if (!employer) return res.status(404).json({ message: "Employer profile not found" });

        const txns = await HiringTransaction.findAll({
            where: { employer_id: employer.employer_id },
            include: [
                {
                    model: JobApplication,
                    include: [
                        { model: Job, attributes: ["title", "location"] },
                        { model: JobSeeker, include: [{ model: User, attributes: ["name", "email"] }] },
                    ],
                },
            ],
            order: [["hired_at", "DESC"]],
        });

        const paidNpr = txns.filter(t => t.status === "completed").reduce((s, t) => s + (t.fee_paisa || 0), 0) / 100;
        const pendingNpr = txns.filter(t => t.status === "initiated").reduce((s, t) => s + (t.fee_paisa || 0), 0) / 100;
        const waivedCount = txns.filter(t => t.status === "waived").length;

        return res.json({
            transactions: txns,
            summary: {
                total_hires: txns.length,
                waived_hires: waivedCount,
                paid_fee_npr: paidNpr,
                pending_fee_npr: pendingNpr,
                total_fee_npr: paidNpr + pendingNpr,
            },
        });
    } catch (err) {
        console.error("getMyHiringFees error:", err.message);
        return res.status(500).json({ message: "Server error" });
    }
};

// ─── Admin: all hiring transactions ──────────────────────────────────────────
const adminGetAllHiringTransactions = async (req, res) => {
    try {
        const { status } = req.query;
        const where = status ? { status } : {};

        const txns = await HiringTransaction.findAll({
            where,
            include: [
                {
                    model: Employer,
                    attributes: ['employer_id', 'company_name', 'is_premium'],
                    include: [{ model: User, attributes: ['name', 'email'] }],
                },
                {
                    model: JobApplication,
                    include: [{ model: Job, attributes: ['title', 'location'] }],
                },
            ],
            order: [['hired_at', 'DESC']],
        });

        const totalCollected = txns.filter(t => ['completed', 'paid'].includes(t.status)).reduce((s, t) => s + (t.fee_paisa || 0), 0) / 100;
        const totalPending = txns.filter(t => ['initiated', 'pending'].includes(t.status)).reduce((s, t) => s + (t.fee_paisa || 0), 0) / 100;
        const totalWaived = txns.filter(t => t.status === 'waived').length;

        return res.json({
            transactions: txns,
            total: txns.length,
            summary: {
                total_collected_npr: totalCollected,
                total_pending_npr: totalPending,
                total_waived_hires: totalWaived,
            },
        });
    } catch (err) {
        console.error('adminGetAllHiringTransactions error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

export {
    initiateHiringPayment,
    verifyHiringPayment,
    getMyHiringFees,
    adminGetAllHiringTransactions
}