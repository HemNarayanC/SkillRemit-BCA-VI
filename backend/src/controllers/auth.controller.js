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
      sameSite: 'lax',
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

const oauthLogin = async (req, res) => {
  if (!req.user) return res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=oauth`);

  const token = generateToken(req.user);

  // Store token in HTTP-only cookie
  res.cookie('jwt', token, {
    httpOnly: true,   // JS cannot access
    secure: process.env.NODE_ENV === 'production', // HTTPS only
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });

  // Redirect to frontend
  // console.log("Google OAuth successful, redirecting to frontend.", `${process.env.FRONTEND_URL}/auth/oauth-success`);
  res.redirect(`${process.env.FRONTEND_URL}/auth/oauth-success`);
}

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

const isAuthenticated = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // console.log("Authenticated user from isAuthenticated:", req.user);

    // Return user info (from token)
    const { user_id, email, role } = req.user;

    // Fetch profile_image from DB
    const userFromDb = await User.findOne({
      where: { user_id },
      attributes: ['name', 'language', 'profile_image']
    });

    if (!userFromDb) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, language, profile_image } = userFromDb;

    return res.json({
      authenticated: true,
      user: { user_id, name, email, role, language, profile_image }
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

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Received email:", email);

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.is_verified)
      return res.status(403).json({ message: "User not verified" });

    await OTPVerification.update(
      { is_used: true },
      { where: { user_id: user.user_id, type: 'password_reset' } }
    );

    await createAndSendOTP(user, 'password_reset');

    res.json({ message: "OTP sent to your email" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otpRecord = await OTPVerification.findOne({
      where: {
        user_id: user.user_id,
        otp_code: otp,
        type: 'password_reset',
        is_used: false,
        expires_at: { [Op.gt]: new Date() }
      }
    });

    if (!otpRecord)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    user.password_hash = await hashPassword(newPassword);
    await user.save();

    otpRecord.is_used = true;
    await otpRecord.save();

    res.json({ message: "Password reset successful" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export {
  registerUser,
  loginUser,
  verifyOTP,
  logoutUser,
  getUserProfile,
  isAuthenticated,
  oauthLogin,
  setPassword,
  forgotPassword,
  resetPassword
}