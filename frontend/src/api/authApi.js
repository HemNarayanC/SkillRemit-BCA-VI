import axios from "axios";
import { api } from "../config/axios.js";

const register = async (userData) => {
  const response = await api.post(`/auth/register`, userData);
  return response.data;
};

const login = async (data) => {
  const response = await api.post(`/auth/login`, {
    email: data.email,
    password: data.password,
  }, { withCredentials: true });
  return response.data;
};

const logout = async () => {
  const response = await api.post(`/auth/logout`);
  return response.data;
};

const verifyOTP = async ({ email, otp }) => {
  const response = await api.post("/auth/verify-otp", {
    email,
    otp,
  });
  return response.data;
};

/* Resend OTP */
const resendOTP = async (email) => {
  const response = await api.post("/auth/resend-otp", {
    email,
  });
  return response.data;
};
``
export { register, login, logout, verifyOTP, resendOTP };
