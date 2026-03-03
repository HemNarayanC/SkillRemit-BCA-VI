import { api } from "../config/axios.js";

const handleError = (err) => {
  if (err.response?.data) throw err.response.data;
  throw { message: "Internal server error" };
};


const createTrainerProfile = async (data) => {
  try {
    const res = await api.post("/trainers/me", data, { withCredentials: true });
    return res.data;
  } catch (err) { handleError(err); }
};

const getMyTrainerProfile = async () => {
  try {
    const res = await api.get("/trainers/me", { withCredentials: true });
    return res.data;
  } catch (err) { handleError(err); }
};

const updateMyTrainerProfile = async (data) => {
  try {
    const res = await api.put("/trainers/me", data, { withCredentials: true });
    return res.data;
  } catch (err) { handleError(err); }
};

const listAllTrainers = async (status = "all") => {
  try {
    const params = {};
    if (status && status !== "all") {
      params.status = status;
    }

    const response = await api.get("/admin/trainers", {
      params,
      withCredentials: true,
    });

    return response.data;
  } catch (err) {
    console.error("listAllTrainers error:", err);
    throw err;
  }
};

const verifyTrainer = async (trainerId, verification_status) => {
  try {
    const response = await api.put(
      `/trainers/${trainerId}/verify`,
      { verification_status },
      { withCredentials: true }
    );

    return response.data;
  } catch (err) {
    console.error(
      "verifyTrainerApi error:",
      err.response?.data || err.message
    );
    throw err;
  }
};

const listVerifiedTrainers = async () => {
  try {
    const res = await api.get("/trainers/verified");
    return res.data;
  } catch (err) { handleError(err); }
};

const getMyTrainerCourses = async () => {
  try {
    const res = await api.get("/trainers/me/courses", { withCredentials: true });
    return res.data;
  } catch (err) { handleError(err); }
};

const createTrainerCourse = async (data) => {
  try {
    const res = await api.post("/trainers/me/courses", data, { withCredentials: true });
    return res.data;
  } catch (err) { handleError(err); }
};

const updateTrainerCourse = async (course_id, data) => {
  try {
    const res = await api.put(`/trainers/me/courses/${course_id}`, data, { withCredentials: true });
    return res.data;
  } catch (err) { handleError(err); }
};

const deleteTrainerCourse = async (course_id) => {
  try {
    const res = await api.delete(`/trainers/me/courses/${course_id}`, { withCredentials: true });
    return res.data;
  } catch (err) { handleError(err); }
};

const addSkillToCourse = async (course_id, skill_id) => {
  try {
    const res = await api.post(`/trainers/me/courses/${course_id}/skills`, { skill_id }, { withCredentials: true });
    return res.data;
  } catch (err) { handleError(err); }
};

const removeSkillFromCourse = async (course_id, skill_id) => {
  try {
    const res = await api.delete(`/trainers/me/courses/${course_id}/skills/${skill_id}`, { withCredentials: true });
    return res.data;
  } catch (err) { handleError(err); }
};

const listPublicCourses = async (params = {}) => {
  try {
    const res = await api.get("/trainers/courses", { params });
    return res.data;
  } catch (err) { handleError(err); }
};

// ═══ UTILITY ══════════════════════════════════════════════════

/**
 * Check which extra roles the current user has.
 * Returns: { hasEmployerProfile: bool, hasTrainerProfile: bool }
 * Useful for ProfileRoleBadge and conditional routing.
 */
const checkUserRoles = async () => {
  const results = await Promise.allSettled([
    getMyEmployerProfile(),
    getMyTrainerProfile(),
  ]);
  return {
    hasEmployerProfile: results[0].status === "fulfilled",
    hasTrainerProfile: results[1].status === "fulfilled",
  };
};

export {
  createTrainerProfile,
  getMyTrainerProfile,
  updateMyTrainerProfile,
  verifyTrainer,
  listVerifiedTrainers,
  getMyTrainerCourses,
  createTrainerCourse,
  updateTrainerCourse,
  deleteTrainerCourse,
  addSkillToCourse,
  removeSkillFromCourse,
  listPublicCourses,
  checkUserRoles,
  listAllTrainers
}