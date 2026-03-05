import { api } from "../config/axios.js";

const handleError = (err) => {
  if (err.response?.data) throw err.response.data;
  throw { message: "Internal server error" };
};

const listAllJobSeekers = async (status) => {
  try {
    const response = await api.get("/admin/job-seekers", { params: { status }, withCredentials: true });
    console.log("Fetched job seekers:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching job seekers:", error);
    throw error;
  }
};

const getJobSeekerProfile = async () => {
  try {
    const response = await api.get("/users/jobseeker/profile", { withCredentials: true });
    // response.data is already normalized by backend
    return response.data;
  } catch (error) {
    console.error("Error fetching job seeker profile:", error);
    throw error;
  }
};

const addJobSeeker = async (jobSeekerData) => {
  try {
    const response = await api.post("/job-seekers", jobSeekerData);
    return response.data;
  } catch (error) {
    console.error("Error adding job seeker:", error);
    throw error;
  }
};

const updateJobSeekerProfile = async (data) => {
  try {
    const res = await api.put("/users/jobseeker/profile", data, { withCredentials: true });
    return res.data;
  } catch (err) { handleError(err); }
};

// ── Skills ───────────────────────────────────────────────────
/** Returns [{ skill_id, skill_name, JobSeekerSkill: { proficiency_level } }] */
const getMySkills = async () => {
  try {
    const res = await api.get("/users/jobseeker/skills", { withCredentials: true });
    return res.data; // { skills: [...] }
  } catch (err) { handleError(err); }
};

/** Add a skill.  body: { skill_id, proficiency_level } */
const addMySkill = async (skill_id, proficiency_level = "basic") => {
  try {
    const res = await api.post(
      "/users/jobseeker/skills",
      { skill_id, proficiency_level },
      { withCredentials: true }
    );
    return res.data;
  } catch (err) { handleError(err); }
};

/** Update proficiency.  body: { proficiency_level } */
const updateMySkill = async (skill_id, proficiency_level) => {
  try {
    const res = await api.put(
      `/users/jobseeker/skills/${skill_id}`,
      { proficiency_level },
      { withCredentials: true }
    );
    return res.data;
  } catch (err) { handleError(err); }
};

const removeMySkill = async (skill_id) => {
  try {
    const res = await api.delete(`/users/jobseeker/skills/${skill_id}`, { withCredentials: true });
    return res.data;
  } catch (err) { handleError(err); }
};

/** All skills in the system (for dropdown) */
const getAllSkills = async () => {
  try {
    const res = await api.get("/skills", { withCredentials: true });
    return res.data; // { skills: [...] }
  } catch (err) { handleError(err); }
};

// ── Applications ─────────────────────────────────────────────
/** status: '' | 'pending' | 'shortlisted' | 'hired' | 'rejected' */
const getMyApplications = async (status = "") => {
  try {
    const res = await api.get("/users/jobseeker/applications", {
      params: status ? { status } : {},
      withCredentials: true,
    });
    return res.data; // { applications: [...] }
  } catch (err) { handleError(err); }
};

const getApplicationStats = async () => {
  try {
    const res = await api.get("/users/jobseeker/applications/stats", { withCredentials: true });
    return res.data; // { stats: { total, pending, shortlisted, hired, rejected } }
  } catch (err) { handleError(err); }
};

const withdrawApplication = async (application_id) => {
  try {
    const res = await api.delete(`/users/jobseeker/applications/${application_id}`, { withCredentials: true });
    return res.data;
  } catch (err) { handleError(err); }
};

// ── AI Match ─────────────────────────────────────────────────
const analyzeJobMatch = async (job_id, jobseeker_id) => {
  try {
    const res = await api.post(`/ai/match/${job_id}/${jobseeker_id}`, {}, { withCredentials: true });
    return res.data;
  } catch (err) { handleError(err); }
};

const getCheckUsage = async (jobseeker_id) => {
  try {
    const res = await api.get(`/ai/checks/${jobseeker_id}`, { withCredentials: true });
    return res.data;
  } catch (err) { handleError(err); }
};

// ── Training ─────────────────────────────────────────────────
const getTrainingCourses = async (params = {}) => {
  try {
    const res = await api.get("/training/courses", { params, withCredentials: true });
    return res.data; // { courses: [...] }
  } catch (err) { handleError(err); }
};

const getCourseDetails = async (course_id) => {
  try {
    const res = await api.get(`/training/courses/${course_id}`, { withCredentials: true });
    return res.data;
  } catch (err) { handleError(err); }
};

// ── Skill Analysis (dashboard summary) ───────────────────────
/** Returns skill gap summary computed server-side */
const getSkillAnalysis = async () => {
  try {
    const res = await api.get("/users/jobseeker/skill-analysis", { withCredentials: true });
    console.log("Fetched skill analysis:", res.data);
    return res.data;
  } catch (err) { handleError(err); }
};

// ── Notifications ─────────────────────────────────────────────
const getNotifications = async () => {
  try {
    const res = await api.get("/notifications", { withCredentials: true });
    return res.data; // { notifications: [...] }
  } catch (err) { handleError(err); }
};

const markNotificationRead = async (notification_id) => {
  try {
    const res = await api.patch(
      `/notifications/${notification_id}/read`,
      {},
      { withCredentials: true }
    );
    return res.data;
  } catch (err) { handleError(err); }
};

const markAllRead = async () => {
  try {
    const res = await api.patch("/notifications/read-all", {}, { withCredentials: true });
    return res.data;
  } catch (err) { handleError(err); }
};

// ── Dashboard summary ─────────────────────────────────────────
const getDashboardSummary = async () => {
  try {
    const res = await api.get("/users/jobseeker/dashboard", { withCredentials: true });
    return res.data;
  } catch (err) { handleError(err); }
};

export {
  listAllJobSeekers,
  addJobSeeker,
  getJobSeekerProfile,
  updateJobSeekerProfile,
  getMySkills,
  addMySkill,
  updateMySkill,
  removeMySkill,
  getAllSkills,
  getMyApplications,
  getApplicationStats,
  withdrawApplication,
  analyzeJobMatch,
  getCheckUsage,
  getTrainingCourses,
  getCourseDetails,
  getSkillAnalysis,
  getNotifications,
  markNotificationRead,
  markAllRead,
  getDashboardSummary
};
