import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { FaGoogle, FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { id: "jobseeker", label: "Job Seeker" },
    { id: "employer", label: "Employer" },
    { id: "trainer", label: "Trainer" },
  ];

  const roleIcons = {
    jobseeker: <User size={16} />,
    employer: <Briefcase size={16} />,
    trainer: <GraduationCap size={16} />,
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "jobseeker", // default
    agree: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

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
    if (!formData.name) newErrors.name = "Full name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.agree)
      newErrors.agree = "You must accept terms & conditions";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const res = await register(formData);
      const userEmail = formData.email;
      setSuccessMsg(res.message); // "User registered. OTP sent to email."
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "jobseeker",
        agree: false,
      });
      navigate("/auth/verify-otp", { state: { email: userEmail } });
      // if (res.message && res.message.includes("OTP sent")) {
      //   navigate("/auth/verify-otp", { state: { email: userEmail } });
      // } else {
      //   alert(res.message || "Registration successful!");
      // }
    } catch (err) {
      console.error(err);
      setErrors({ api: err.response?.data?.message || "Registration failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleContinueWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const handleContinueWithFacebook = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/facebook`;
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Background blobs */}
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-(--navy) opacity-90" />
      <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-(--navy) opacity-90" />
      <div className="absolute -bottom-20 right-1/4 h-64 w-64 rounded-full bg-(--navy) opacity-80" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-8">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-2xl shadow-2xl lg:grid-cols-[1.4fr_1fr]">

          {/* Left: Form */}
          <div className="flex flex-col justify-center bg-white p-8 lg:p-12">
            <div className="w-full max-w-md mx-auto">

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* FULL NAME */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-600 font-semibold mb-1">
                    Full name
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Rustam Chaudhary"
                      className={`w-full pl-7 py-2 border-0 border-b-2 bg-transparent focus:outline-none ${errors.name
                        ? "border-red-500"
                        : "border-gray-300 focus:border-blue-600"
                        }`}
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-600 font-semibold mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="ropem83995@icousd.com"
                      className={`w-full pl-7 py-2 border-0 border-b-2 bg-transparent focus:outline-none ${errors.email
                        ? "border-red-500"
                        : "border-gray-300 focus:border-blue-600"
                        }`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* PHONE */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-600 font-semibold mb-1">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+9779833334444"
                      className={`w-full pl-7 py-2 border-0 border-b-2 bg-transparent focus:outline-none ${errors.phone
                        ? "border-red-500"
                        : "border-gray-300 focus:border-blue-600"
                        }`}
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

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

                {/* PASSWORD */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-600 font-semibold mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full pl-7 pr-8 py-2 border-0 border-b-2 bg-transparent focus:outline-none ${errors.password
                        ? "border-red-500"
                        : "border-gray-300 focus:border-blue-600"
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-600 font-semibold mb-1">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full pl-7 pr-8 py-2 border-0 border-b-2 bg-transparent focus:outline-none ${errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300 focus:border-blue-600"
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>

                {/* TERMS */}
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agree"
                    checked={formData.agree}
                    onChange={handleChange}
                    className="accent-blue-600"
                  />
                  I agree to the terms & conditions
                </label>
                {errors.agree && <p className="text-red-500 text-xs">{errors.agree}</p>}

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 w-full rounded-full bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Creating account...
                    </>
                  ) : (
                    <>
                      Sign up <span>→</span>
                    </>
                  )}
                </button>

                {/* SIGN IN LINK */}
                <p className="text-center text-sm text-gray-600 pt-3">
                  Already have an account?{" "}
                  <Link className="text-blue-600 font-semibold" to="/auth/login">
                    Sign in
                  </Link >
                </p>
              </form>

              {/* SOCIAL SIGN UP */}
              <div className="mt-6 border-t pt-4">
                <p className="mb-3 text-center text-xs text-gray-500">
                  Or sign up with
                </p>
                <div className="flex gap-2">
                  <button onClick={handleContinueWithGoogle} className="flex-1 flex items-center justify-center gap-2 rounded-lg border py-2 text-sm hover:cursor-pointer">
                    <FaGoogle className="text-red-500" /> Google
                  </button>
                  <button onClick={handleContinueWithFacebook} className="flex-1 flex items-center justify-center gap-2 rounded-lg border py-2 text-sm hover:cursor-pointer">
                    <FaFacebookF className="text-blue-600" /> Facebook
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 rounded-lg border py-2 text-sm hover:cursor-pointer">
                    <FaLinkedinIn className="text-blue-700" /> LinkedIn
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Right: Animation & Welcome Text */}
          <div className="hidden lg:flex flex-col items-center justify-center bg-navy/5 p-8">
            <div className="flex flex-col items-center mt-auto text-center relative top-18">
              <h1 className="text-3xl lg:text-4xl font-bold font-orbitron text-primary">
                Welcome to SkillSetu
              </h1>
              <p className="text-exo text-muted-foreground relative top-8">
                Sign up to explore jobs, connect with trainers, and grow your skills.
              </p>
            </div>


            <div className="flex h-full w-full max-w-md items-center justify-center">
              <Lottie
                path="/Login Leady.json"
                loop
                autoplay
                className="w-full max-w-sm"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
