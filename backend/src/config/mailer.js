import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

// Verify connection configuration
transporter.verify((err, success) => {
    if (err) console.log("Email transporter error:", err);
    else console.log("Email transporter ready!");
});

// Send OTP email
export const sendOTPEmail = async (toEmail, otp) => {
    const mailOptions = {
        from: process.env.MAIL_FROM,
        to: toEmail,
        subject: "Your OTP for Registration",
        text: `Your OTP code is: ${otp}. It expires in ${process.env.OTP_EXPIRES_IN}.`,
        html: `<p>Your OTP code is: <b>${otp}</b></p><p>Expires in: ${process.env.OTP_EXPIRES_IN} minutes</p>`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("OTP sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending OTP:", error);
        return false;
    }
};