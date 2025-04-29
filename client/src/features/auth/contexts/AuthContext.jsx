// src/features/auth/contexts/AuthContext.jsx
// Provides authentication state and actions (login, logout, signup) to the application.

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginUser, signupUser, fetchUserProfile } from "../services/authService"; // Use feature-specific service

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start true to check token
  const [authError, setAuthError] = useState(null);

  // --- Logout Function (needed by initial check) ---
  const logout = useCallback(() => { // Wrap in useCallback
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthError(null); // Clear errors on logout
  }, []);

  // Check for existing token on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // No need to set token here, fetchUserProfile uses interceptor
          const userData = await fetchUserProfile(); 
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            console.warn("Auth check: Token found but profile fetch failed.");
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
  }, [logout]); // Add logout as dependency

  // Persist user in localStorage when user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // --- New function to handle token from OAuth redirect --- 
  const handleOAuthToken = useCallback(async (token) => {
    if (!token) return false; // No token provided
    
    setIsLoading(true);
    setAuthError(null);
    localStorage.setItem("token", token); // Store token immediately
    
    try {
      const userData = await fetchUserProfile(); // Fetch profile using the stored token (via interceptor)
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        setIsLoading(false);
        return true; // Indicate success
      } else {
        // Profile fetch failed even with token
        console.error("OAuth Error: Could not fetch user profile with provided token.");
        logout(); // Clean up inconsistent state
        setIsLoading(false);
        return false; // Indicate failure
      }
    } catch (error) {
      console.error("OAuth profile fetch error:", error);
      setAuthError(error.message || "Failed to fetch profile after OAuth login.");
      logout(); // Clean up on error
      setIsLoading(false);
      return false; // Indicate failure
    }
  }, [logout]); // Add logout dependency

  // --- Auth Actions --- 
  // login function now ONLY handles credential-based login
  const login = async (credentials) => {
    // Remove direct handling of user/token here
    // if (credentials.user && credentials.token) { ... }

    setIsLoading(true);
    setAuthError(null);
    try {
      // Handle regular credential-based login
      const data = await loginUser(credentials);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      setIsAuthenticated(true);
      return { success: true };

    } catch (error) {
      setAuthError(error.message || "Login failed");
      setIsAuthenticated(false);
      setUser(null); // Ensure user is null on failed login
      logout(); // Use the logout function for cleanup
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
      logout(); // Use the logout function for cleanup
      return { 
        success: false, 
        error: error.message || "Signup failed" 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout defined earlier with useCallback

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        authError,
        login, // For credentials login
        handleOAuthToken, // For OAuth callback
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
