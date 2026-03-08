import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  initiateHiringPayment,
  verifyHiringPayment,
  getMyHiringFees,
  adminGetAllHiringTransactions
} from '../controllers/hiring.controller.js';

const router = express.Router();

router.post('/:application_id/initiate', authMiddleware(['employer']), initiateHiringPayment);

router.get('/verify', authMiddleware(['employer']), verifyHiringPayment);

router.get('/my-fees', authMiddleware(['employer']), getMyHiringFees);

router.get('/admin/all', authMiddleware(['admin']), adminGetAllHiringTransactions);

export default router;