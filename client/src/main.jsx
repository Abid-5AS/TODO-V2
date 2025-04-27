// src/main.jsx
// Main entry point for the React application.

import React from "react";
import ReactDOM from "react-dom/client";
import AppProviders from "./providers/AppProviders";
import AppRoutes from "./routes/AppRoutes";
import { initializeAppearanceSettings } from "./features/settings/services/appearanceSettingsService";
import "./styles/index.css";

// Initialize appearance settings before rendering
initializeAppearanceSettings()
  .catch((error) => {
    console.error("Failed to initialize appearance settings:", error);
    // Continue rendering the app even if settings fail to load
  })
  .finally(() => {
    ReactDOM.createRoot(document.getElementById("root")).render(
      <React.StrictMode>
        <AppProviders>
          <AppRoutes />
        </AppProviders>
      </React.StrictMode>
    );
  });
