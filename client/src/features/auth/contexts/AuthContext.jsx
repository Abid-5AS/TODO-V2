// src/features/auth/contexts/AuthContext.jsx
// Provides authentication state and actions (login, logout, signup) to the application.

import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, signupUser, fetchUserProfile } from "../services/authService"; // Use feature-specific service

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start true to check token
  const [authError, setAuthError] = useState(null);

  // Check for existing token on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await fetchUserProfile(); // Fetch user data using token
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Token might be invalid
            logout();
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          logout(); // Logout on error
        }
      } 
      setIsLoading(false); // Finished checking
    };
    checkAuthStatus();
  }, []);

  // Persist user in localStorage when user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // --- Auth Actions --- 
  const login = async (credentials) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      let userData, tokenValue;
      // Handle OAuth login (when user and token are passed directly)
      if (credentials.user && credentials.token) {
        userData = credentials.user;
        tokenValue = credentials.token;
      } else {
        // Handle regular credential-based login
        const data = await loginUser(credentials);
        userData = data.user;
        tokenValue = data.token;
      }

      setUser(userData);
      localStorage.setItem("token", tokenValue);
      setIsAuthenticated(true);
      return { success: true };

    } catch (error) {
      setAuthError(error.message || "Login failed");
      setIsAuthenticated(false);
      setUser(null); // Ensure user is null on failed login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        success: false,
        error: error.message || "Login failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userDataInput) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const data = await signupUser(userDataInput);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      setAuthError(error.message || "Signup failed");
      setIsAuthenticated(false);
      setUser(null); // Ensure user is null on failed signup
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { 
        success: false, 
        error: error.message || "Signup failed" 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Optionally clear other app state if needed
    // No navigation here, handled by component calling logout
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        authError,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
