import express from 'express';
import passport from "../config/passport.js";
import { googleLogin, isAuthenticated, loginUser, logoutUser, registerUser, verifyOTP } from '../controllers/auth.controller.js';
import { resendOTP } from '../services/otpService.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/logout', logoutUser);
router.get("/me", authMiddleware(), isAuthenticated);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  googleLogin
);

export default router;
 