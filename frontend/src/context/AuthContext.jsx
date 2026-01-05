import { createContext, useContext, useState } from "react";
import { register, login, logout } from "../api/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // user info
  const [loading, setLoading] = useState(false);

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
      const data = await login(credentials, { withCredentials: true });
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
      await logout({ withCredentials: true });
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);
