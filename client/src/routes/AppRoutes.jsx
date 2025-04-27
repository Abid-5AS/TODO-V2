// src/routes/AppRoutes.jsx
// Defines the main application routes using React Router.

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/contexts/AuthContext";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import PublicRoute from "../features/auth/components/PublicRoute"; // We'll create this
import LoginPage from "../features/auth/components/LoginPage";
import SignupPage from "../features/auth/components/SignupPage";
import OAuthSuccess from "../features/auth/components/OAuthSuccess";
import DashboardLayout from "../features/dashboard/components/DashboardLayout";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import SettingsPage from "../features/settings/pages/SettingsPage";
import StatsPage from "../features/stats/pages/StatsPage";
import IslamicHomePage from "../features/dashboard/pages/IslamicHomePage";
import Navbar from "../features/dashboard/components/Navbar"; // Public Navbar
import ErrorBoundary from "../components/ErrorBoundary"; // Import the ErrorBoundary component
import ErrorPage from "../pages/ErrorPage";

// Placeholder for Help page (could be moved to a 'help' feature later)
const HelpPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Help & Support</h1>
    <p>Help and documentation will be available here.</p>
  </div>
);

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Navigate to="/login" replace />
            </>
          }
        />
        <Route
          path="/login"
          element={
            <>
              <Navbar />
              <LoginPage />
            </>
          }
        />
        <Route
          path="/signup"
          element={
            <>
              <Navbar />
              <SignupPage />
            </>
          }
        />
      </Route>

      {/* Protected Routes within DashboardLayout */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard/islamic" replace />} />
          <Route
            path="islamic"
            element={
              <ErrorBoundary showDetails={false}>
                <IslamicHomePage />
              </ErrorBoundary>
            }
          />
          <Route path="today" element={<DashboardPage />} />
          <Route path="upcoming" element={<DashboardPage />} />
          <Route path="overdue" element={<DashboardPage />} />
          <Route path="completed" element={<DashboardPage />} />
          <Route path="all" element={<DashboardPage />} />
          <Route path="project/:projectId" element={<DashboardPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="stats" element={<StatsPage />} />
          {/* Add more protected dashboard routes here */}
        </Route>
      </Route>

      {/* OAuth Success Route (Public but redirects) */}
      <Route path="/oauth-success" element={<OAuthSuccess />} />

      {/* Error Routes */}
      <Route path="/404" element={<ErrorPage statusCode={404} />} />
      <Route path="/error" element={<ErrorPage />} />

      {/* Fallback Redirect */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/404" replace />
          )
        }
      />
    </Routes>
  );
}

export default AppRoutes;
