import express from 'express';
import { loginUser, logoutUser, registerUser, verifyOTP } from '../controllers/auth.controller.js';
import { resendOTP } from '../services/otpService.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/logout', logoutUser)

export default router;
