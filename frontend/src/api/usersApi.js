import { api } from "../config/axios.js";

const handleError = (err) => {
  if (err.response?.data) throw err.response.data;
  throw { message: "Internal server error" };
};

const getAllEmployers = async (status = null) => {
  try {
    const url = status ? `/admin/employers?status=${status}` : "/admin/employers";
    const res = await api.get(url, { withCredentials: true });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

const verifyEmployer = async (employerId, status, note = "") => {
  console.log(`Verifying employer ${employerId} with status ${status} and note: ${note}`);
  try {
    const res = await api.put(
      `/admin/employers/${employerId}/verify`,
      { status, note },
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

const getAllJobs = async () => {
  try {
    const res = await api.get("/admin/jobs", { withCredentials: true });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

const addSkill = async (name) => {
  try {
    const res = await api.post(
      "/admin/skills",
      { name },
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
  } catch (err) {
    handleError(err);
  }
};

const createJobSeekerProfile = async (formData) => {
  try {
    const res = await api.post(
      "/create/jobseeker/profile",
      formData,
      {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" }
      }
    );
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

const getJobSeekerProfile = async () => {
  try {
    const res = await api.get(
      "/users/jobseeker/profile",
      { withCredentials: true }
    );
    console.log("JobSeeker profile fetch result:", res.data);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

const getUserProfile = async () => {
  try {
    const res = await api.get("/profile", { withCredentials: true });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export {
  getAllEmployers,
  verifyEmployer,
  getAllJobs,
  addSkill,
  listVerifiedEmployers,
  createJobSeekerProfile,
  getJobSeekerProfile,
  getUserProfile
};
