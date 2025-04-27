// src/features/auth/components/ProtectedRoute.jsx
// Protects routes that require authentication. Redirects to login if not authenticated.

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading Authentication...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />; // Redirect if not authenticated
};

export default ProtectedRoute;
