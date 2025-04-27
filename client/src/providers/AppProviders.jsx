// src/providers/AppProviders.jsx
// Centralizes all application-wide context providers.

import React from "react";
import { AuthProvider } from "../features/auth/contexts/AuthContext";
import SonnerToaster from "../components/ui/sonner-toaster";
import { BrowserRouter as Router } from "react-router-dom";

const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
        <Router>
          {children}
          <SonnerToaster />
        </Router>
    </AuthProvider>
  );
};

export default AppProviders;
