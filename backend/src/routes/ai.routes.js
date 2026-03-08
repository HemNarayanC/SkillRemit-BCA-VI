import express from 'express';
import { analyzeJobMatch, getCheckUsage, getRecommendedCourses } from '../controllers/ai.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// JobSeeker analyzes a job match
router.post(
  '/job/:job_id/match/:jobseeker_id',
  authMiddleware(['jobseeker']),
  analyzeJobMatch
);

router.get('/checks/:jobseeker_id', authMiddleware(['jobseeker', 'employer']), getCheckUsage);
router.get(
  '/recommendations/:jobseeker_id',
  authMiddleware(['jobseeker']),
  getRecommendedCourses
);

export default router;
