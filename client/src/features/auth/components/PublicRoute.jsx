// src/features/auth/components/PublicRoute.jsx
// Protects public routes (like login/signup) from authenticated users. Redirects to dashboard if authenticated.

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    ); // Show loading indicator while checking auth state
  }

  // If authenticated, redirect away from public routes
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />; // Render children (public pages) if not authenticated
};

export default PublicRoute;
