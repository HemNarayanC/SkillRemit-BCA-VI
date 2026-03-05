import { api } from "../config/axios";

// GET /premium/plans
const getPremiumPlans = async () => {
    try {
        const { data } = await api.get("/aipremium/plans");
        if (!data || !Array.isArray(data.plans)) {
            throw new Error("Invalid response from server while fetching premium plans");
        }
        return data;
    } catch (err) {
        console.error("getPremiumPlans error:", err.message || err);
        throw new Error("Failed to fetch premium plans. Please try again later.");
    }
};

// GET /premium/status?role=jobseeker|employer
const getPremiumStatus = async (role = "jobseeker") => {
    try {
        const { data } = await api.get("/aipremium/status");
        return data;
    } catch (err) {
        console.error("getPremiumStatus error:", err.message || err);
        throw new Error("Failed to fetch premium status. Please refresh the page or try again later.");
    }
};

// POST /premium/initiate  — returns { pidx, payment_url, plan, amount_npr }z
// Frontend should redirect to payment_url after calling this.
const initiatePremiumPayment = async (plan, role) => {
    try {
        const { data } = await api.post("/aipremium/initiate", { plan, role });
        return data;
    } catch (err) {
        throw err.response?.data || err;
    }
};

// GET /premium/verify?pidx=XXX  — called on the return_url page
// Returns { message, is_premium, role, plan, transaction_id, paid_at }
const verifyPremiumPayment = async (pidx) => {
    try {
        const { data } = await api.get(`/aipremium/verify?pidx=${pidx}`);
        return data;
    } catch (err) {
        throw err.response?.data || err;
    }
};

export {
    getPremiumPlans,
    getPremiumStatus,
    initiatePremiumPayment,
    verifyPremiumPayment
}