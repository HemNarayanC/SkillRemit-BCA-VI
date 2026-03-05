import axios from "axios";
import { JobSeeker, Employer, User } from "../models/index.js";
import PremiumTransaction from "../models/PremiumTransaction.js";

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_BASE_URL = process.env.KHALTI_BASE_URL;
const AI_FREE_LIMIT = parseInt(process.env.AI_FREE_LIMIT || "5", 10);

const PREMIUM_PLANS = {
  premium_monthly: { label: "Premium Monthly", amount_npr: 299 },
  premium_yearly: { label: "Premium Yearly", amount_npr: 2499 },
};

// ─── INTERNAL: Khalti initiate ────────────────────────────────────────────────
const _khaltiInitiate = async ({ user, profile_id, role, plan }) => {
  const planDetails = PREMIUM_PLANS[plan];
  const amount_paisa = planDetails.amount_npr * 100;
  const purchase_order_id = `PREM-${role.toUpperCase()}-${user.user_id}-${Date.now()}`;

  const payload = {
    return_url: `${process.env.FRONTEND_URL}${process.env.KHALTI_RETURN_URL}` || "http://localhost:5173/payment/success",
    website_url: process.env.KHALTI_WEBSITE_URL || "http://localhost:5173",
    amount: amount_paisa,
    purchase_order_id,
    purchase_order_name: planDetails.label,
    customer_info: {
      name: user.name || "User",
      email: user.email || "user@example.com",
      phone: user.phone || "9800000000",
    },
    product_details: [{
      identity: purchase_order_id,
      name: planDetails.label,
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

  const txn = await PremiumTransaction.create({
    user_id: user.user_id,
    profile_id,
    role,
    pidx: data.pidx,
    purchase_order_id,
    amount_paisa,
    status: "Initiated",
    plan,
    khalti_customer: { name: user.name, email: user.email, phone: user.phone },
  });

  return { pidx: data.pidx, payment_url: data.payment_url, transaction_id: txn.transaction_id };
};

// ─── INTERNAL: Khalti verify ──────────────────────────────────────────────────
const _khaltiVerify = async (pidx) => {
  const { data } = await axios.post(
    `${KHALTI_BASE_URL}/lookup/`,
    { pidx },
    { headers: { Authorization: `Key ${KHALTI_SECRET_KEY}` } }
  );

  if (data.status !== "Completed") {
    throw new Error(`Khalti payment not completed. Status: ${data.status}`);
  }

  const txn = await PremiumTransaction.findOne({ where: { pidx } });
  if (!txn) throw new Error(`No PremiumTransaction found for pidx: ${pidx}`);

  await txn.update({
    status: "Completed",
    paid_at: new Date(),
    khalti_response: data,
  });

  return txn;
};

// ─── GET /premium/plans ───────────────────────────────────────────────────────
const getPremiumPlans = (req, res) => {
  const plans = Object.entries(PREMIUM_PLANS).map(([key, val]) => ({
    key,
    label: val.label,
    amount_npr: val.amount_npr,
    amount_paisa: val.amount_npr * 100,
  }));
  return res.json({ plans });
};

// ─── GET /premium/status ──────────────────────────────────────────────────────
const getPremiumStatus = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const role = req.user.current_role;

    const Model = role === "employer" ? Employer : JobSeeker;
    const profile = await Model.findOne({ where: { user_id: userId }, attributes: ["is_premium", "ai_checks_used"], });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    const checksUsed = profile.ai_checks_used;
    const isPremium = profile.is_premium;

    return res.json({
      is_premium: profile.is_premium,
      ai_checks_used: profile.ai_checks_used,
      ai_checks_limit: profile.is_premium ? null : AI_FREE_LIMIT,
      ai_checks_remaining: isPremium ? null : Math.max(0, AI_FREE_LIMIT - checksUsed),
      is_premium: isPremium,
      limit_reached: !isPremium && checksUsed >= AI_FREE_LIMIT,
      role,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─── POST /premium/initiate ───────────────────────────────────────────────────
const initiatePremiumPayment = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const role = req.user.current_role;
    const { plan = "premium_monthly" } = req.body;

    if (!PREMIUM_PLANS[plan]) {
      return res.status(400).json({
        message: `Invalid plan. Choose from: ${Object.keys(PREMIUM_PLANS).join(", ")}`,
      });
    }

    if (!["jobseeker", "employer"].includes(role)) {
      return res.status(400).json({ message: "role must be 'jobseeker' or 'employer'" });
    }

    const dbUser = await User.findOne({
      where: { user_id: userId },
      attributes: ["user_id", "name", "email", "phone"],
    });
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    const Model = role === "employer" ? Employer : JobSeeker;
    console.log(Model)
    const profile = await Model.findOne({ where: { user_id: userId } });
    if (!profile) return res.status(404).json({ message: `${role} profile not found` });
    if (profile.is_premium) return res.status(400).json({ message: "Already a premium member" });

    const profile_id = role === "employer" ? profile.employer_id : profile.jobseeker_id;

    const result = await _khaltiInitiate({
      user: { user_id: dbUser.user_id, name: dbUser.name, email: dbUser.email, phone: dbUser.phone },
      profile_id,
      role,
      plan,
    });

    return res.status(200).json({
      message: "Payment initiated. Redirect the user to payment_url.",
      pidx: result.pidx,
      payment_url: result.payment_url,
      plan,
      amount_npr: PREMIUM_PLANS[plan].amount_npr,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to initiate premium payment" });
  }
};

// ─── GET /premium/verify?pidx=XXX ────────────────────────────────────────────
const verifyPremiumPayment = async (req, res) => {
  try {
    const { pidx } = req.query;
    if (!pidx) return res.status(400).json({ message: "pidx query parameter is required" });

    const txn = await _khaltiVerify(pidx);
    const Model = txn.role === "employer" ? Employer : JobSeeker;
    const idField = txn.role === "employer" ? "employer_id" : "jobseeker_id";

    await Model.update(
      { is_premium: true, ai_checks_used: 0 },
      { where: { [idField]: txn.profile_id } }
    );

    return res.status(200).json({
      message: "Payment verified. Premium activated!",
      is_premium: true,
      role: txn.role,
      plan: txn.plan,
      transaction_id: txn.transaction_id,
      paid_at: txn.paid_at,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err.message || "Payment verification failed" });
  }
};

export {
  getPremiumPlans,
  getPremiumStatus,
  initiatePremiumPayment,
  verifyPremiumPayment,
};