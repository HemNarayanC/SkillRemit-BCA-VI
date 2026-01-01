import express from 'express';
import {
  createEmployer,
  getEmployerProfile,
  updateEmployerProfile,
  verifyEmployer,
  listVerifiedEmployers
} from '../controllers/employer.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { uploadEmployerDocuments } from '../config/multer.js';

const router = express.Router();

// Employer-specific routes
router.post('/', authMiddleware(['employer']), uploadEmployerDocuments.array('document_urls'), createEmployer);
router.get('/me', authMiddleware(['employer']), getEmployerProfile);
router.put('/me', authMiddleware(['employer']), updateEmployerProfile);

// Admin verification
router.put('/:employer_id/verify', authMiddleware(['admin']), verifyEmployer);

// Public route
router.get('/verified', listVerifiedEmployers);

export default router;
