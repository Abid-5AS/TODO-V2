// src/providers/AppProviders.jsx
// Centralizes all application-wide context providers.

import React from "react";
import { AuthProvider } from "../features/auth/contexts/AuthContext";
import { PrayerLogProvider } from "../features/prayer/contexts/PrayerLogContext";
import { DashboardProvider } from "../features/dashboard/contexts/DashboardContext";
import SonnerToaster from "../components/ui/sonner-toaster";
import { BrowserRouter as Router } from "react-router-dom";

const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <PrayerLogProvider>
        <Router>
          <DashboardProvider>
          {children}
          <SonnerToaster />
          </DashboardProvider>
        </Router>
      </PrayerLogProvider>
    </AuthProvider>
  );
};

export default AppProviders;
