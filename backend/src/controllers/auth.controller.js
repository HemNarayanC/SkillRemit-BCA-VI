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

export {
  registerUser,
  verifyOTP
}