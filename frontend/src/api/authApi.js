import { api } from "../config/axios.js";

// Register
const register = async (userData) => {
  try {
    const response = await api.post(`/auth/register`, userData, { withCredentials: true });
    return response.data;
  } catch (err) {
    console.error("Register error:", err);
    throw err.response?.data || { message: "Server error" };
  }
};

// Login
const login = async (data) => {
  try {
    const response = await api.post(
      `/auth/login`,
      { identifier: data.identifier, password: data.password },
      { withCredentials: true }
    );
    return response.data;
  } catch (err) {
    console.error("Login error:", err);
    throw err.response?.data || { message: "Server error" };
  }
};

// Logout
const logout = async () => {
  try {
    const response = await api.post(`/auth/logout`, {}, { withCredentials: true });
    return response.data;
  } catch (err) {
    console.error("Logout error:", err);
    throw err.response?.data || { message: "Server error" };
  }
};

const isAuthenticated = async () => {
  try {
    const response = await api.get(`/auth/me`, { withCredentials: true }); // important
    return response.data;
  } catch (err) {
    console.error("Auth check error:", err);
    throw err.response?.data || { message: "Not authenticated" };
  }
};

// Verify OTP
const verifyOTP = async ({ email, otp }) => {
  try {
    const response = await api.post(`/auth/verify-otp`, { email, otp }, { withCredentials: true });
    return response.data;
  } catch (err) {
    console.error("Verify OTP error:", err);
    throw err.response?.data || { message: "Server error" };
  }
};

// Resend OTP
const resendOTP = async (email) => {
  try {
    const response = await api.post(`/auth/resend-otp`, { email }, { withCredentials: true });
    return response.data;
  } catch (err) {
    console.error("Resend OTP error:", err);
    throw err.response?.data || { message: "Server error" };
  }
};

const forgotPassword = async (email) => {
  try {
    const response = await api.post(
      "/auth/forgot-password",
      { email },
      { withCredentials: true }
    );
    return response.data; // { message: "OTP sent to your email" }
  } catch (err) {
    console.error("Forgot Password error:", err);
    throw err.response?.data || { message: "Server error" };
  }
};

const resetPassword = async ({ email, otp, newPassword }) => {
  try {
    const response = await api.post(
      "/auth/reset-password",
      { email, otp, newPassword },
      { withCredentials: true }
    );
    return response.data; // { message: "Password reset successful" }
  } catch (err) {
    console.error("Reset Password error:", err);
    throw err.response?.data || { message: "Server error" };
  }
};

const setPassword = async (password) => {
  const res = await api.post("/auth/set-password", { password }, { withCredentials: true });
  return res.data;
};

export { register, login, logout, isAuthenticated, verifyOTP, resendOTP, forgotPassword, resetPassword, setPassword };
