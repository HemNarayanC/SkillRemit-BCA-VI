import { useState, useRef } from "react";
import Lottie from "lottie-react";
import { verifyOTP, resendOTP } from "../api/authApi";
import { useLocation, useNavigate } from "react-router-dom";

const OTPVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialEmail = location.state?.email || "";
  const otpLength = 6;

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(Array(otpLength).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // refs for inputs
  const inputRefs = useRef([]);

  // if (!email) {
  //   return (
  //     <>
  //       <p className="text-red-500">No email provided for OTP verification.</p>
  //       <Navigate to="/auth/register" />
  //     </>
  //   );
  // }

  // Handle input change
  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/, ""); // only digits
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // move to next input
    if (index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasteData) return;

    const newOtp = [...otp];
    for (let i = 0; i < otpLength; i++) {
      newOtp[i] = pasteData[i] || "";
    }
    setOtp(newOtp);

    // focus the next empty input
    const nextIndex = newOtp.findIndex((d) => d === "");
    if (nextIndex !== -1) inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const otpCode = otp.join("");
    if (otpCode.length !== otpLength) {
      setError(`Please enter all ${otpLength} digits of the OTP.`);
      return;
    }

    try {
      setLoading(true);
      const response = await verifyOTP({ email, otp: otpCode });
      setSuccessMsg(response.message);
      navigate("/auth/login");
    } catch (err) {
      console.error(err);
      setError(err?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccessMsg("");
    try {
      setLoading(true);
      const response = await resendOTP(email);
      setSuccessMsg(response.message);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-background flex items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-6xl grid-cols-1 rounded-2xl shadow-2xl lg:grid-cols-[1.4fr_1fr] overflow-hidden">

        {/* LEFT: OTP FORM */}
        <div className="flex flex-col justify-center bg-white p-8 lg:p-12">
          <div className="w-full max-w-md mx-auto text-center">
            <h1 className="text-3xl lg:text-4xl font-orbitron text-primary mb-4">
              Verify your OTP
            </h1>

            {!initialEmail && (
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border-b focus:outline-none focus:border-primary mb-2z"
                />
              </div>
            )}

            <p className="text-exo text-muted-foreground mb-6">
              Enter the 6-digit code sent to <strong>{email}</strong>
            </p>

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            {successMsg && <p className="text-green-500 text-sm mb-2">{successMsg}</p>}

            <form onSubmit={handleSubmit} className="space-y-6" onPaste={handlePaste}>
              <div className="flex justify-center gap-2 mb-4">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    id={`otp-${i}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(e, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    className="w-12 h-12 text-center border-b-2 border-gray-300 focus:border-primary text-xl font-semibold outline-none"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground hover:bg-secondary transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                ) : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={handleResend}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Resend OTP
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Lottie */}
        <div className="hidden lg:flex items-center justify-center bg-navy/5 p-8">
          <img
            src="/otp.png"
            className="w-full max-w-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
