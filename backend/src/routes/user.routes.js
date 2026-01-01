import express from 'express';
import { createJobSeekerProfile, getJobSeekerProfile } from '../controllers/jobSeeker.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { uploadJobSeekerDocuments } from '../config/multer.js';

const router = express.Router();

// All routes protected
router.post('/create/jobseeker/profile', authMiddleware(['jobseeker']), uploadJobSeekerDocuments.array('documents', 5), createJobSeekerProfile);
router.get('/jobseeker/profile', authMiddleware(['jobseeker']), getJobSeekerProfile);

export default router;
