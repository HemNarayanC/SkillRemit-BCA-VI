import express from "express";
import {
  getJobSeekerProfile,
  updateJobSeekerProfile,
  getMySkills,
  addMySkill,
  updateMySkill,
  removeMySkill,
  getMyApplications,
  getApplicationStats,
  withdrawApplication,
  getDashboardSummary,
  getSkillAnalysis,
} from "../controllers/jobSeeker.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Protect all routes for jobseeker role only
router.use(authMiddleware(['jobseeker']));

// Profile
router.get("/profile", getJobSeekerProfile);
router.put("/profile", updateJobSeekerProfile);

// Skills
router.get("/skills", getMySkills);
router.post("/skills", addMySkill);
router.put("/skills/:skill_id", updateMySkill);
router.delete("/skills/:skill_id", removeMySkill);

// Applications
router.get("/applications", getMyApplications);
router.get("/applications/stats", getApplicationStats);
router.delete("/applications/:application_id", withdrawApplication);

// Dashboard & AI
router.get("/dashboard", getDashboardSummary);
router.get("/skill-analysis", getSkillAnalysis);

export default router;