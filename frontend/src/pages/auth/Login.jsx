import { useState } from "react";
import Lottie from "lottie-react";
import { Eye, EyeOff, Lock, Mail, KeyRound, Phone, User, Briefcase, GraduationCap, ShieldUser } from "lucide-react";
import { FaGoogle, FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { REGISTER_ROUTE, RESET_PASSWORD_ROUTE } from "../../constant/routes";

const Login = () => {

  const getIdentifierIcon = (value) => {
    if (!value) return <Mail size={18} />;

    if (value.includes("@")) {
      return <Mail size={18} />;
    }

    if (/^[+\d]/.test(value)) {
      return <Phone size={18} />;
    }

    return <Mail size={18} />;
  };

  const { login, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
    role: "jobseeker"
  });

  const roles = [
    { id: "jobseeker", label: "Job Seeker" },
    { id: "employer", label: "Employer" },
    { id: "trainer", label: "Trainer" },
    { id: "admin", label: "Admin" },
  ];

  const roleIcons = {
    jobseeker: <User size={16} />,
    employer: <Briefcase size={16} />,
    trainer: <GraduationCap size={16} />,
    admin: <ShieldUser size={16} />,
  };

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [forgotMode, setForgotMode] = useState(false);
  const [serverError, setServerError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const newErrors = {};
    if (!formData.identifier) newErrors.identifier = "Email or phone is required";
    if (!forgotMode && !formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      // Send identifier, password and selected role to backend via auth context
      const res = await login({
        identifier: formData.identifier,
        password: formData.password,
        role: formData.role,
        rememberMe: formData.rememberMe
      });

      setFormData({
        identifier: "",
        password: "",
        rememberMe: false,
        role: "jobseeker"
      });
      navigate('/');
    } catch (err) {
      console.error(err);
      setServerError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setErrors({});
    setServerError(null);

    if (!formData.identifier) {
      setErrors({ identifier: "Email is required" });
      return;
    }

    // basic validation to ensure identifier is email for forgot flow
    if (!formData.identifier.includes("@")) {
      setErrors({ identifier: "Please provide an email address to reset password" });
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(formData.identifier); // call API
      alert(res.message); // "OTP sent to your email"

      // Navigate to Reset Password page with email
      navigate(RESET_PASSWORD_ROUTE, { state: { email: formData.identifier } });

    } catch (err) {
      console.error(err);
      setErrors({ api: err.message || "Server error" });
    } finally {
      setLoading(false);
    }
  };

  const handleContinueWithgGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const handleContinueWithFacebook = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/facebook`;
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-8">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-2xl shadow-2xl lg:grid-cols-[1fr_1.4fr]">

          {/* LEFT – LOTTIE */}
          <div className="hidden lg:flex flex-col items-center justify-center bg-card p-8">
            <div className="text-center mb-6">
              <h1 className="mb-2 text-3xl lg:text-4xl font-orbitron font-bold text-primary">
                Connect. Learn. Earn.
              </h1>
            </div>
            <div className="flex h-full w-full max-w-md items-center justify-center">
              <img
                src="/Login.svg"
                alt="Login Illustration"
                className="w-full max-w-sm"
              />
            </div>
          </div>

          {/* RIGHT – FORM */}
          <div className="flex flex-col justify-center bg-card px-10 py-12">

            {/* Role Tabs (compact) */}
            <div className="flex justify-center gap-4 my-8">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, role: r.id }))}
                  className={`flex items-center gap-1 rounded-lg border px-3 py-1 text-sm transition
                        ${formData.role === r.id
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  {roleIcons[r.id]} {r.label}
                </button>
              ))}
            </div>

            <h1 className="mb-8 text-3xl font-orbitron font-bold text-foreground">
              {forgotMode ? "Forgot password" : ""}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* EMAIL */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-exo font-semibold mb-2 text-muted-foreground">
                  Email or Phone
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {getIdentifierIcon(formData.identifier)}
                  </div>
                  <input
                    type="text"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    placeholder="Email or phone number"
                    className={`w-full pl-7 py-2 border-0 border-b-2 bg-card focus:outline-none ${errors.identifier
                      ? "border-destructive"
                      : "border-border focus:border-primary"
                      }`}
                  />
                </div>
                {errors.identifier && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.identifier}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              {!forgotMode && (
                <div>
                  <label className="block text-xs uppercase tracking-wider font-exo font-semibold mb-2 text-muted-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full pl-7 pr-8 py-2 border-0 border-b-2 bg-card focus:outline-none ${errors.password
                        ? "border-destructive"
                        : "border-border focus:border-primary"
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-destructive text-xs mt-1">{errors.password}</p>
                  )}
                </div>
              )}

              {/* server error */}
              {serverError && (
                <p className="text-destructive text-sm mt-1">{serverError}</p>
              )}

              {/* REMEMBER & FORGOT */}
              {!forgotMode && (
                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="accent-primary"
                    />
                    <span className="text-sm text-muted-foreground">
                      Remember me
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setForgotMode(true)}
                    className="flex items-center gap-1 text-sm font-medium text-primary hover:cursor-pointer hover:underline"
                  >
                    <KeyRound size={14} /> Forgot password?
                  </button>
                </div>
              )}

              {/* SUBMIT */}
              {forgotMode ? (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="mt-8 w-full rounded-full bg-primary py-3 font-exo font-semibold text-primary-foreground transition hover:bg-secondary flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></span>
                      Please wait...
                    </>
                  ) : (
                    "Send reset OTP"
                  )}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-8 w-full rounded-full bg-primary py-3 font-exo font-semibold text-primary-foreground transition hover:bg-secondary flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></span>
                      Please wait...
                    </>
                  ) : (
                    <>
                      Sign in <span>→</span>
                    </>
                  )}
                </button>
              )}

              {/* SIGNUP REDIRECT */}
              {!forgotMode && (
                <p className="mt-6 text-center text-sm font-exo text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    to={REGISTER_ROUTE}
                    className="text-primary font-semibold hover:underline"
                  >
                    Sign up
                  </Link>
                </p>
              )}

              {/* SWITCH MODE */}
              {forgotMode && (
                <p className="text-center text-sm font-exo text-muted-foreground">
                  Remembered your password?{" "}
                  <button
                    type="button"
                    onClick={() => setForgotMode(false)}
                    className="text-primary font-semibold hover:cursor-pointer hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </form>

            {/* SOCIAL LOGIN */}
            {!forgotMode && (
              <div className="mt-10 border-t border-border pt-6">
                <p className="mb-4 text-center text-xs font-exo text-muted-foreground">
                  Or continue with
                </p>
                <div className="flex gap-3">
                  <button onClick={handleContinueWithgGoogle} className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm font-exo text-foreground hover:cursor-pointer">
                    <FaGoogle className="text-red-500" /> Google
                  </button>
                  <button onClick={handleContinueWithFacebook} className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm font-exo text-foreground hover:cursor-pointer">
                    <FaFacebookF className="text-blue-600" /> Facebook
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm font-exo text-foreground hover:cursor-pointer">
                    <FaLinkedinIn className="text-blue-700" /> LinkedIn
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
