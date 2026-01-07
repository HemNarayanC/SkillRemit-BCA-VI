import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  if (!email) navigate("/auth/forgot-password");

  const otpLength = 6;
  const [otp, setOtp] = useState(Array(otpLength).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const inputRefs = useRef([]);

  const handleOtpChange = (e, i) => {
    const val = e.target.value.replace(/\D/, "");
    if (!val) return;
    const newOtp = [...otp];
    newOtp[i] = val;
    setOtp(newOtp);
    if (i < otpLength - 1) inputRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (e, i) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (newOtp[i]) {
        newOtp[i] = "";
        setOtp(newOtp);
      } else if (i > 0) {
        inputRefs.current[i - 1]?.focus();
        newOtp[i - 1] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const otpCode = otp.join("");
    if (otpCode.length !== otpLength) return setError("Enter complete OTP");
    if (!newPassword) return setError("New password required");
    if (newPassword !== confirmPassword) return setError("Passwords do not match");

    try {
      setLoading(true);
      const res = await resetPassword({ email, otp: otpCode, newPassword });
      setSuccessMsg(res.message);
      setTimeout(() => navigate("/auth/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-4xl grid-cols-1 rounded-2xl shadow-2xl lg:grid-cols-[1.4fr_1fr] overflow-hidden">

        {/* LEFT: Form */}
        <div className="flex flex-col justify-center bg-card p-8 lg:p-12">
          <h1 className="text-3xl font-orbitron text-primary mb-6 text-center">
            Reset Password
          </h1>

          {error && <p className="text-destructive text-sm mb-2">{error}</p>}
          {successMsg && <p className="text-green-500 text-sm mb-2">{successMsg}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* OTP Section */}
            <div>
              <label className="block text-sm font-exo text-muted-foreground mb-2">OTP</label>
              <div className="flex justify-center gap-2">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    maxLength="1"
                    value={d}
                    onChange={(e) => handleOtpChange(e, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    className="w-12 h-12 text-center border-b-2 border-border focus:border-primary text-xl font-semibold outline-none"
                  />
                ))}
              </div>
            </div>

            {/* New Password */}
            <div className="relative">
              <label className="block text-sm font-exo text-muted-foreground mb-2">New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="********"
                className="mt-1 w-full border-b px-3 py-2 border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label className="block text-sm font-exo text-muted-foreground mb-2">Confirm Password</label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="********"
                className="mt-1 w-full border-b px-3 py-2 border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-muted-foreground"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full py-3 bg-primary text-primary-foreground font-exo hover:bg-secondary transition"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>

        {/* RIGHT: Illustration */}
        <div className="hidden lg:flex items-center justify-center bg-navy/5 p-8">
          <img src="/otp.png" alt="Reset Illustration" className="w-full max-w-sm" />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
