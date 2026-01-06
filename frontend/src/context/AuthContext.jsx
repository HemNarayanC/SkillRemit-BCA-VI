import { createContext, useContext, useState, useEffect } from "react";
import { register, login, logout, isAuthenticated } from "../api/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // user info
  const [loading, setLoading] = useState(false);

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
