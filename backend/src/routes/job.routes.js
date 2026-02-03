import express from 'express';
import {
  createJob,
  getEmployerJobs,
  updateJob,
  closeJob,
  listOpenJobs,
  getJobDetails
} from '../controllers/job.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { uploadJobImage } from '../config/multer.js';

const router = express.Router();

// Employer routes (protected)
router.post('/', authMiddleware(['employer']), uploadJobImage.single('image'), createJob);
router.get('/me', authMiddleware(['employer']), getEmployerJobs);
router.put('/:job_id', authMiddleware(['employer']), updateJob);
router.put('/:job_id/close', authMiddleware(['employer']), closeJob);

// Public route to list open jobs
router.get('/open', listOpenJobs);
router.get('/open/:job_id', authMiddleware(['employer', 'jobseeker', 'admin']), getJobDetails);

export default router;
