// src/features/auth/components/OAuthSuccess.jsx
// Handles the redirect after successful OAuth authentication.

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
// Remove fetchUserProfile import if context handles it
// import { fetchUserProfile } from "../services/authService";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  // Get the specific login function that handles token-only auth
  const { handleOAuthToken } = useAuth(); // Assume we add handleOAuthToken to context

  useEffect(() => {
    const processOAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (token && handleOAuthToken) {
        try {
          // Pass the token to the context to handle login and profile fetching
          const loginSuccess = await handleOAuthToken(token);
          if (loginSuccess) {
            navigate("/dashboard", { replace: true }); // Redirect on success
          } else {
            // Context handles error logging, just redirect
            navigate("/login", { replace: true });
          }
        } catch (error) {
          // Context should ideally handle errors, but catch just in case
          console.error("OAuth processing error:", error);
          navigate("/login", { replace: true });
        }
      } else if (!token) {
        console.error("OAuth Error: No token found in URL params.");
        navigate("/login", { replace: true });
      } else {
        // handleOAuthToken function not available from context?
        console.error("OAuth Error: Auth context not configured correctly.");
        navigate("/login", { replace: true });
      }
    };

    processOAuth();
    // Dependency: only run once when component mounts to process URL
  }, [navigate, handleOAuthToken]); 

  // Keep the loading indicator UI
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Signing you in...</h2>
        <p className="text-gray-600">
          Please wait while we complete the authentication.
        </p>
        <div className="w-8 h-8 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin mx-auto mt-4"></div>
      </div>
    </div>
  );
};

export default OAuthSuccess;
