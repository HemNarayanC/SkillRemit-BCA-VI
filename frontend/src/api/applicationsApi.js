import { api } from "../config/axios.js";

// GET /jobs/:job_id/applicants?status=pending|shortlisted|rejected|hired
export const getJobApplicants = async (jobId, status = "") => {
  try {
    const params = status ? { status } : {};
    const response = await api.get(`/applications/jobs/${jobId}/applicants`, {
      params,
      withCredentials: true,
    });
    return response.data;
  } catch (err) {
    console.error("Get job applicants error:", err);
    throw err.response?.data || { message: "Server error" };
  }
};

// GET /applicants?status=...
export const getAllApplicants = async (status = "") => {
  try {
    const params = status ? { status } : {};
    const response = await api.get("/applications/applicants", {
      params,
      withCredentials: true,
    });
    return response.data;
  } catch (err) {
    console.error("Get all applicants error:", err);
    throw err.response?.data || { message: "Server error" };
  }
};

// GET /applications/:application_id
export const getApplicantDetails = async (applicationId) => {
  try {
    const response = await api.get(`/applications/applications/${applicationId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (err) {
    console.error("Get applicant details error:", err);
    throw err.response?.data || { message: "Server error" };
  }
};

// PATCH /applications/:application_id/status
export const updateApplicationStatus = async (applicationId, status) => {
  try {
    const response = await api.patch(
      `/applications/applications/${applicationId}/status`,
      { status },
      { withCredentials: true }
    );
    return response.data;
  } catch (err) {
    console.error("Update status error:", err);
    throw err.response?.data || { message: "Server error" };
  }
};

// PATCH /applications/:application_id/shortlist
export const shortlistApplicant = async (applicationId) => {
  try {
    const response = await api.patch(
      `/applications/applications/${applicationId}/shortlist`,
      {},
      { withCredentials: true }
    );
    return response.data;
  } catch (err) {
    console.error("Shortlist error:", err);
    throw err.response?.data || { message: "Server error" };
  }
};

// PATCH /applications/:application_id/reject
export const rejectApplicant = async (applicationId) => {
  try {
    const response = await api.patch(
      `/applications/applications/${applicationId}/reject`,
      {},
      { withCredentials: true }
    );
    return response.data;
  } catch (err) {
    console.error("Reject error:", err);
    throw err.response?.data || { message: "Server error" };
  }
};

// PATCH /applications/:application_id/hire
export const hireApplicant = async (applicationId) => {
  try {
    const response = await api.patch(
      `/applications/applications/${applicationId}/hire`,
      {},
      { withCredentials: true }
    );
    return response.data;
  } catch (err) {
    console.error("Hire error:", err);
    throw err.response?.data || { message: "Server error" };
  }
};

// GET /applicants/stats
export const getApplicantStats = async () => {
  try {
    const response = await api.get("/applications/applicants/stats", {
      withCredentials: true,
    });
    return response.data;
  } catch (err) {
    console.error("Get stats error:", err);
    throw err.response?.data || { message: "Server error" };
  }
};