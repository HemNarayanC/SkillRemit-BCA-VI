import { createContext, useContext, useState, useEffect } from "react";
import { register, login, logout, isAuthenticated, resetPassword, forgotPassword } from "../api/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // user info
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await isAuthenticated();
        setUser(data.user);
      } catch (err) {
        setUser(null);
        console.log("Not authenticated on load");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleRegister = async (userData) => {
    setLoading(true);
    try {
      const data = await register(userData);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      throw err.response?.data || { message: "Server error" };
    }
  };

  const handleLogin = async (credentials) => {
    setLoading(true);
    try {
      const data = await login(credentials);
      setUser(data.user); // store user info in state only
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      throw err.response?.data || { message: "Server error" };
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleForgotPassword = async (email) => {
    setLoading(true);
    try {
      const data = await forgotPassword(email);
      setLoading(false);
      return data; // { message: "OTP sent to your email" }
    } catch (err) {
      setLoading(false);
      throw err.response?.data || { message: "Server error" };
    }
  };

  const handleResetPassword = async ({ otp, newPassword, email }) => {
    setLoading(true);
    try {
      const data = await resetPassword({ otp, newPassword, email });
      setLoading(false);
      return data; // { message: "Password reset successful" }
    } catch (err) {
      setLoading(false);
      throw err.response?.data || { message: "Server error" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register: handleRegister,
        login: handleLogin,
        logout: handleLogout,
        forgotPassword: handleForgotPassword,
        resetPassword: handleResetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);
