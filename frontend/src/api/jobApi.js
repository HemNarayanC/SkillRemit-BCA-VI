import { api } from "../config/axios.js";

const createJob = async (formData) => {
  try {
    const response = await api.post("/jobs", formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (err) {
    console.error("Create job error:", err);
    throw err.response?.data || { message: "Server error" };
  }
};

const getEmployerJobs = async () => {
  try {
    const response = await api.get("/jobs/me", { withCredentials: true });
    console.log("Get employer jobs response:", response.data);
    return response.data;
  } catch (err) {
    console.error("Get employer jobs error:", err);
    throw err.response?.data || { message: "Server error" };
  }
};

const updateJob = async (jobId, data) => {
  try {
    const isFormData = data instanceof FormData;
    const response = await api.put(`/jobs/${jobId}`, data, {
      withCredentials: true,
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return response.data;
  } catch (err) {
    console.error("Update job error:", err);
    throw err.response?.data || { message: "Server error" };
  }
};

const closeJob = async (jobId) => {
  try {
    const response = await api.put(`/jobs/${jobId}/close`, {}, { withCredentials: true });
    return response.data;
  } catch (err) {
    console.error("Close job error:", err);
    throw err.response?.data || { message: "Server error" };
  }
};

const listOpenJobs = async (params = {}) => {
  try {
    const response = await api.get("/jobs/open", { params });
    return response.data;
  } catch (err) {
    console.error("List open jobs error:", err);
    throw err.response?.data || { message: "Network error" };
  }
};

const fetchJobDetails = async (jobId) => {
  try {
    const response = await api.get(`/jobs/open/${jobId}`, {
      withCredentials: true,
    });
    console.log("Fetch job details response:", response.data);
    return response.data;
  } catch (err) {
    console.error("Fetch job details error:", err);
    throw err.response?.data || { message: "Network error" };
  }
};

const analyzeJobMatch = async (jobId, jobseekerId) => {
  console.log(`Analyzing job match for jobId: ${jobId}, jobseekerId: ${jobseekerId}`);
  try {
    const response = await api.post(
      `/ai/job/${jobId}/match/${jobseekerId}`,
      {}, // params are in URL; body intentionally empty
      { withCredentials: true }
    );
    console.log("Analyze job match response:", response.data);
    return response.data;
  } catch (err) {
    console.error("Analyze job match error:", err.response?.data || err.message);
    // Preserve the full error shape so the modal can detect limit_reached
    throw err.response?.data || { message: "AI analysis failed" };
  }
};

const applyToJob = async (jobId, coverLetter) => {
  try {
    const response = await api.post(
      `users/jobseeker/apply/${jobId}`,
      { cover_letter: coverLetter },
      { withCredentials: true }
    );
    return response.data;
  } catch (err) {
    console.error("Apply to job error:", err);
    throw err.response?.data || { message: "Something went wrong" };
  }
};

export { createJob, getEmployerJobs, updateJob, closeJob, listOpenJobs, fetchJobDetails, analyzeJobMatch, applyToJob }