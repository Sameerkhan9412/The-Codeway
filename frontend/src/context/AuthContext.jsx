import React, { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../utils/axiosClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user and token from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axiosClient.post("/user/login", {
        email,
        password,
      });
      if (response.data.success) {
        const { user, token } = response.data;
        setUser(user);
        setToken(token);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
        return { success: true };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call backend logout API to clear cookie and blacklist token
      await axiosClient.post("/user/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    }
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{ user: { ...user, token }, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
