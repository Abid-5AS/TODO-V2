// src/providers/AppProviders.jsx
// Centralizes all application-wide context providers.

import React from "react";
import { AuthProvider } from "../features/auth/contexts/AuthContext";
import { ToastProvider } from "../hooks/use-toast"; // Assuming use-toast provides a Provider
import SonnerToaster from "../components/ui/sonner-toaster";
import { BrowserRouter as Router } from "react-router-dom";

const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <ToastProvider> {/* Assuming useToast requires a Provider */} 
        <Router>
          {children}
          <SonnerToaster />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

export default AppProviders;
