import { Employer, OTPVerification, Trainer, User } from '../models/index.js'
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
    const { identifier, password, role: currentRole } = req.body;

    if (!identifier || !password || !currentRole) {
      return res.status(400).json({
        message: "Identifier, password, and role are required."
      });
    }

    // Detect email vs phone
    const isEmail = identifier.includes("@");

    const user = await User.findOne({
      where: {
        ...(isEmail ? { email: identifier } : { phone: identifier })
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found for the selected role."
      });
    }

    // if (!user.roles.includes(currentRole)) {
    //   return res.status(403).json({ message: "You do not have access to this role." });
    // }

    const roles = Array.isArray(user.roles)
      ? user.roles
      : JSON.parse(user.roles || "[]");

    if (!roles.includes(currentRole)) {
      return res.status(403).json({
        message: "You do not have access to this role."
      });
    }

    // Must be verified
    if (!user.is_verified) {
      return res.status(403).json({
        message: "Account not verified. Please check your email for OTP."
      });
    }

    // EMPLOYER CHECK
    if (currentRole === "employer") {

      const employer = await Employer.findOne({
        where: { user_id: user.user_id }
      });

      if (!employer) {
        return res.status(403).json({
          message: "Employer profile not found."
        });
      }

      if (employer.verification_status !== "verified") {
        return res.status(403).json({
          message: `Employer account is ${employer.verification_status}.`
        });
      }
    }

    // TRAINER CHECK
    if (currentRole === "trainer") {

      const trainer = await Trainer.findOne({
        where: { user_id: user.user_id }
      });

      if (!trainer) {
        return res.status(403).json({
          message: "Trainer profile not found."
        });
      }

      if (trainer.verification_status !== "verified") {
        return res.status(403).json({
          message: `Trainer account is ${trainer.verification_status}.`
        });
      }
    }

    // Password must exist (important for OAuth users)
    if (!user.password_hash) {
      return res.status(400).json({
        message: "Password not set. Please login using social login or set a password."
      });
    }

    // Check password
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials."
      });
    }

    // Generate JWT
    const token = generateToken(user, currentRole);

    // Set cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        full_name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.roles,
        current_role: currentRole,
        profile: user.profile_image,
        language: user.language
      }
    });

  } catch (err) {
    console.error("Login error:", err);
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

    // Return user info (from token)
    const { user_id, email, role, current_role } = req.user;

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
      user: { user_id, name, email, role, current_role, language, profile_image }
    });
  } catch (err) {
    console.error("Auth check error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getUserProfile = async (req, res) => {
  // console.log("Fetching profile for user_id:", req.user);
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

const setPassword = async (req, res) => {
  const { password } = req.body;
  const user = req.user;

  if (user.password_hash) {
    return res.status(400).json({ message: "Password already set." });
  }

  user.password_hash = await hashPassword(password);
  await user.save();

  return res.json({ message: "Password set successfully. You can now login manually." });
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // console.log("Received email:", email);

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