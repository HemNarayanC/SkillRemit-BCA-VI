import express from "express";
import {
  getJobApplicants,
  getAllApplicants,
  getApplicantDetails,
  updateApplicationStatus,
  shortlistApplicant,
  rejectApplicant,
  hireApplicant,
  getApplicantStats
} from "../controllers/applications.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();
const employerAuth = authMiddleware(['employer']);

router.get("/jobs/:job_id/applicants", employerAuth, getJobApplicants);
router.get("/applicants", employerAuth, getAllApplicants);
router.get("/applications/:application_id", employerAuth, getApplicantDetails);
router.patch("/applications/:application_id/status", employerAuth, updateApplicationStatus);
router.patch("/applications/:application_id/shortlist", employerAuth, shortlistApplicant);
router.patch("/applications/:application_id/reject", employerAuth, rejectApplicant);
router.patch("/applications/:application_id/hire", employerAuth, hireApplicant);
router.get("/applicants/stats", employerAuth, getApplicantStats);

export default router;