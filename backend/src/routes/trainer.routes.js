/**
 * trainer.routes.js
 * Mount at: /trainers
 */
import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createTrainerProfile,
  getTrainerProfile,
  updateTrainerProfile,
  listVerifiedTrainers,
  verifyTrainer,
  getTrainerCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  addCourseSkill,
  removeCourseSkill,
  listPublicCourses,
} from "../controllers/trainer.controller.js";

const router = express.Router();

// ── Public ──────────────────────────────────────────────────
router.get("/verified", listVerifiedTrainers);
router.get("/courses", listPublicCourses);


router.post("/me", authMiddleware(["trainer", "jobseeker"]), createTrainerProfile);
router.get("/me", authMiddleware(["trainer"]), getTrainerProfile);
router.put("/me", authMiddleware(["trainer"]), updateTrainerProfile);

router.get("/me/courses", authMiddleware(["trainer"]), getTrainerCourses);
router.post("/me/courses", authMiddleware(["trainer"]), createCourse);
router.put("/me/courses/:course_id", authMiddleware(["trainer"]), updateCourse);
router.delete("/me/courses/:course_id", authMiddleware(["trainer"]), deleteCourse);
router.post("/me/courses/:course_id/skills", authMiddleware(["trainer"]), addCourseSkill);
router.delete("/me/courses/:course_id/skills/:skill_id", authMiddleware(["trainer"]), removeCourseSkill);

// ── Admin ────────────────────────────────────────────────────
router.put("/:trainer_id/verify", authMiddleware(["admin"]), verifyTrainer);

export default router;