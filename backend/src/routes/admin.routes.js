import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { listAllEmployers, verifyEmployer, listAllJobs, addSkill } from '../controllers/admin.controller.js';

const router = express.Router();

// Admin-only routes
router.get('/employers', authMiddleware(['admin']), listAllEmployers);
router.put('/employers/:employer_id/verify', authMiddleware(['admin']), verifyEmployer);
router.get('/jobs', authMiddleware(['admin']), listAllJobs);
router.post('/skills', authMiddleware(['admin']), addSkill);

export default router;
