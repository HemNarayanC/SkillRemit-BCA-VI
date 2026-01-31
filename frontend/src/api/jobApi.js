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

const listOpenJobs = async () => {
  try {
    const response = await api.get("/jobs/open");
    return response.data;
  } catch (err) {
    console.error("List open jobs error:", err);
    throw err.response?.data || { message: "Server error" };
  }
};

export { createJob, getEmployerJobs, updateJob, closeJob, listOpenJobs };