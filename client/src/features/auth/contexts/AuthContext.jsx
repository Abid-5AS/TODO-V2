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

  // --- Logout Function ---
  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthError(null); // Clear errors on logout
    // No need to set isLoading here, let refresh handle it
  }, []);

  // --- Function to refresh user profile --- NEW
  const refreshUserProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false); // No token, definitely not loading/authenticated
      setIsAuthenticated(false);
      setUser(null);
      return; // Exit early if no token
    }

    setIsLoading(true); // Start loading indicator
    try {
      const userData = await fetchUserProfile();
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        setAuthError(null); // Clear any previous auth errors
      } else {
        console.warn("Refresh User: Token found but profile fetch failed.");
        logout(); // Logout if fetch fails despite token
      }
    } catch (error) {
      console.error("Refresh User failed:", error);
      // Keep existing authError or set a new one?
      // setAuthError(error.message || "Failed to refresh user data."); 
      logout(); // Logout on error during refresh
    } finally {
      setIsLoading(false); // Finished loading
    }
  }, [logout]);

  // Check auth status on initial load using the refresh function
  useEffect(() => {
    refreshUserProfile();
  }, [refreshUserProfile]); // Run when refreshUserProfile function is defined

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
      // Use the refresh function here too!
      await refreshUserProfile(); 
      // Check if refresh was successful (isAuthenticated would be true)
      if (localStorage.getItem('token')) { // Check token existence as proxy for success
           setIsLoading(false); // Explicitly set loading false after refresh
           return true;
      } else {
          throw new Error("Profile fetch failed after OAuth.");
      }

    } catch (error) { // Catch errors specifically from refreshUserProfile or token check
      console.error("OAuth profile fetch error:", error);
      setAuthError(error.message || "Failed to fetch profile after OAuth login.");
      logout(); // Clean up on error
      setIsLoading(false);
      return false; // Indicate failure
    }
  }, [logout, refreshUserProfile]); // Add dependencies

  // --- Auth Actions --- 
  // login function now ONLY handles credential-based login
  const login = async (credentials) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      // Handle regular credential-based login
      const data = await loginUser(credentials);
      setUser(data.user); // Set user directly
      localStorage.setItem("token", data.token); // Set token
      setIsAuthenticated(true); // Set authenticated status
      // No need to call refreshUserProfile here, login response is sufficient
      return { success: true };

    } catch (error) {
      setAuthError(error.message || "Login failed");
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
      setUser(data.user); // Set user directly
      localStorage.setItem("token", data.token); // Set token
      setIsAuthenticated(true); // Set authenticated status
      return { success: true };
    } catch (error) {
      setAuthError(error.message || "Signup failed");
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
        login,
        handleOAuthToken,
        signup,
        logout,
        refreshUserProfile, // Expose the refresh function
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
