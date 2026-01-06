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
      { email: data.email, password: data.password },
      { withCredentials: true } // important for cookie
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

export { register, login, logout, isAuthenticated, verifyOTP, resendOTP };
