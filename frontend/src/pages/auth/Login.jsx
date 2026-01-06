import { useState } from "react";
import Lottie from "lottie-react";
import { Eye, EyeOff, Lock, Mail, KeyRound } from "lucide-react";
import { FaGoogle, FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [forgotMode, setForgotMode] = useState(false);

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

    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!forgotMode && !formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await login({ email: formData.email, password: formData.password });
      // console.log("Logged in user:", res.user);
      setFormData({
        email: "",
        password: "",
        rememberMe: false,
      });
      navigate('/');
    } catch (err) {
      console.error(err);
      setServerError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueWithgGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
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

            <h1 className="mb-8 text-3xl font-orbitron font-bold text-foreground">
              {forgotMode ? "Forgot password" : ""}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* EMAIL */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-exo font-semibold mb-2 text-muted-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="meghan.tormund@gmail.com"
                    className={`w-full pl-7 py-2 border-0 border-b-2 bg-card focus:outline-none ${errors.email
                      ? "border-destructive"
                      : "border-border focus:border-primary"
                      }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-destructive text-xs mt-1">{errors.email}</p>
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
                    className="flex items-center gap-1 text-sm font-medium text-primary"
                  >
                    <KeyRound size={14} /> Forgot password?
                  </button>
                </div>
              )}

              {/* SUBMIT */}
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
                ) : forgotMode ? (
                  "Send reset link"
                ) : (
                  <>
                    Sign in <span>→</span>
                  </>
                )}
              </button>

              {/* SIGNUP REDIRECT */}
              {!forgotMode && (
                <p className="mt-6 text-center text-sm font-exo text-muted-foreground">
                  Don't have an account?{" "}
                  <a
                    href="/auth/register"
                    className="text-primary font-semibold hover:underline"
                  >
                    Sign up
                  </a>
                </p>
              )}

              {/* SWITCH MODE */}
              {forgotMode && (
                <p className="text-center text-sm font-exo text-muted-foreground">
                  Remembered your password?{" "}
                  <button
                    type="button"
                    onClick={() => setForgotMode(false)}
                    className="text-primary font-semibold"
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
                    <FaGoogle className="text-destructive" /> Google
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm font-exo text-foreground hover:cursor-pointer">
                    <FaFacebookF className="text-primary" /> Facebook
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm font-exo text-foreground hover:cursor-pointer">
                    <FaLinkedinIn className="text-secondary" /> LinkedIn
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
