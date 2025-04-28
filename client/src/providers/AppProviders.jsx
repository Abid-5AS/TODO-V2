// src/providers/AppProviders.jsx
// Centralizes all application-wide context providers.

import React from "react";
import { AuthProvider } from "../features/auth/contexts/AuthContext";
import { PrayerLogProvider } from "../features/prayer/hooks/usePrayerLog.jsx";
import SonnerToaster from "../components/ui/sonner-toaster";
import { BrowserRouter as Router } from "react-router-dom";

const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <PrayerLogProvider>
        <Router>
          {children}
          <SonnerToaster />
        </Router>
      </PrayerLogProvider>
    </AuthProvider>
  );
};

export default AppProviders;
