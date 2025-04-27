// src/main.jsx
// Entry point for the React application. Sets up StrictMode and renders the main App component wrapped in providers.

import React from "react";
import ReactDOM from "react-dom/client";
import AppProviders from "./providers/AppProviders";
import AppRoutes from "./routes/AppRoutes";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  </React.StrictMode>
);
