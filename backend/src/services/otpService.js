import { sendOTPEmail } from "../config/mailer.js";
import OTPVerification from "../models/OTPVerification.js";
import User from "../models/User.js";
import { generateOTP } from "../utils/generateOTP.js";

const createAndSendOTP = async (user) => {
    const otpCode = generateOTP();
     const expiresAt = new Date(Date.now() + Number(process.env.OTP_EXPIRES_IN || 2) * 60 * 1000);

    // Remove old unused OTPs
    await OTPVerification.destroy({
        where: { user_id: user.user_id, is_used: false }
    });

    // Create new OTP
    await OTPVerification.create({
        user_id: user.user_id,
        otp_code: otpCode,
        expires_at: expiresAt,
        is_used: false
    });

    // Send email
    await sendOTPEmail(user.email, otpCode);
};


// Resend OTP
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: "User not found" });

        await createAndSendOTP(user);

        return res.status(200).json({ message: "OTP resent successfully" });
    } catch (err) {
        console.error("Resend OTP error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

export { createAndSendOTP, resendOTP };