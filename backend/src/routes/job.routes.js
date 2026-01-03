import express from 'express';
import {
  createJob,
  getEmployerJobs,
  updateJob,
  closeJob,
  listOpenJobs
} from '../controllers/job.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Employer routes (protected)
router.post('/', authMiddleware(['employer']), createJob);
router.get('/me', authMiddleware(['employer']), getEmployerJobs);
router.put('/:job_id', authMiddleware(['employer']), updateJob);
router.put('/:job_id/close', authMiddleware(['employer']), closeJob);

// Public route to list open jobs
router.get('/open', listOpenJobs);

export default router;
