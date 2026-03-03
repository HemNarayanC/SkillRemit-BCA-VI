import { api } from "../config/axios.js";

const handleError = (err) => {
  if (err.response?.data) throw err.response.data;
  throw { message: "Internal server error" };
};

const createEmployerProfile = async (formData) => {
  try {
    const response = await api.post("/employers", formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating employer profile:", error.response?.data || error.message);
    throw error;
  }
};

const getEmployerProfile = async () => {
  try {
    const res = await api.get("/employers/me", { withCredentials: true });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

const getAICandidates = async (job_id) => {
  try {
    const res = await api.get(`/employers/me/jobs/${job_id}/ai-candidates`, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) { handleError(err); }
};

const updateEmployerProfile = async (data) => {
  try {
    const res = await api.put(
      "/employers/me",
      data,
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

const listVerifiedEmployers = async () => {
  try {
    const res = await api.get("/employers/verified");
    return res.data;
  } catch (err) { handleError(err); }
};

const getEmployerDashboard = async () => {
  try {
    const res = await api.get("/employers/me/dashboard", { withCredentials: true });
    return res.data;
  } catch (err) { handleError(err); }
};

const updateCandidateStatus = async (application_id, status) => {
  try {
    const res = await api.patch(
      `/employers/me/applications/${application_id}/status`,
      { status },
      { withCredentials: true }
    );
    return res.data;
  } catch (err) { handleError(err); }
};

const getHiringAnalytics = async () => {
  try { return (await api.get("/employers/me/analytics", { withCredentials: true })).data; }
  catch (err) { handle(err); }
};

// Premium upgrade
const requestPremiumUpgrade = async () => {
  try { return (await api.post("/employers/me/upgrade", {}, { withCredentials: true })).data; }
  catch (err) { handle(err); }
};

export {
  createEmployerProfile,
  getEmployerProfile,
  updateEmployerProfile,
  listVerifiedEmployers,
  getAICandidates,
  updateCandidateStatus,
  getEmployerDashboard,
  getHiringAnalytics,
  requestPremiumUpgrade
};