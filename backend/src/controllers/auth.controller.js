import { OTPVerification, User } from '../models/index.js'
import { hashPassword, comparePassword } from '../utils/hashPassword.js';
import { Op } from 'sequelize';
import dotenv from 'dotenv';
import { createAndSendOTP, resendOTP } from '../services/otpService.js';
import { generateToken } from '../utils/jwt.js';
dotenv.config();

const registerUser = async (req, res) => {
  try {
    console.log(req.body)
    const { name, email, phone, password, role, language } = req.body;

    // Check if email exists
    const existingUser = await User.findOne({ where: { email } });

    // Already verified → block
    if (existingUser && existingUser.is_verified) {
      return res.status(400).json({
        message: "Account already exists and is verified. Please login."
      });
    }

    // Exists but not verified → resend OTP
    // if (existingUser && !existingUser.is_verified) {
    //   await resendOTP(existingUser);
    //   return res.status(200).json({
    //     message: "Account exists but not verified. OTP resent."
    //   });
    // }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with pending verification
    const user = await User.create({
      name: name,
      email,
      phone,
      password_hash: hashedPassword,
      role,
      language,
      is_verified: false
    });

    // Generate & send OTP
    await createAndSendOTP(user);

    res.status(201).json({ message: "User registered. OTP sent to email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found." });

    // Must be verified
    if (!user.is_verified)
      return res.status(403).json({ message: "Account not verified. Please check your email for OTP." });

    // Check password
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: "Invalid password." });

    // Generate JWT
    const token = generateToken(user);

    // Set cookie
    res.cookie('jwt', token, {
      httpOnly: true,   // JS cannot access
      secure: process.env.NODE_ENV === 'production', // HTTPS only
      sameSite: 'lax', // CSRF protection
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    return res.json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        full_name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile_image,
        language: user.language
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found." });

    const otpRecord = await OTPVerification.findOne({
      where: {
        user_id: user.user_id,
        otp_code: otp,
        is_used: false,
        expires_at: { [Op.gt]: new Date() }
      }
    });

    if (!otpRecord) return res.status(400).json({ message: "Invalid or expired OTP." });

    // Mark OTP as used
    otpRecord.is_used = true;
    await otpRecord.save();

    // Mark user as verified
    user.is_verified = true;
    await user.save();

    res.json({ message: "OTP verified. User account activated." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

const logoutUser = (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ message: 'Logged out successfully' });
};

const isAuthenticated = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Return user info (from token)
    const { user_id, name, email, role, language } = req.user;

    return res.json({
      authenticated: true,
      user: { user_id, name, email, role, language }
    });
  } catch (err) {
    console.error("Auth check error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getUserProfile = async (req, res) => {
  console.log("Fetching profile for user_id:", req.user);
  try {
    const user = await User.findOne({
      where: { user_id: req.user.user_id, is_deleted: false },
      attributes: [
        "user_id",
        "name",
        "email",
        "phone",
        "profile_image",
        "role",
        "language",
        "created_at"
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (err) {
    console.error("Fetch profile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


export {
  registerUser,
  loginUser,
  verifyOTP,
  logoutUser,
  getUserProfile,
  isAuthenticated
}