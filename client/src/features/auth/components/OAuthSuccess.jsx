// src/features/auth/components/OAuthSuccess.jsx
// Handles the redirect after successful OAuth authentication.

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { fetchUserProfile } from "../services/authService"; // Use feature-specific service

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const processOAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (token) {
        localStorage.setItem("token", token);
        try {
          const user = await fetchUserProfile();
          if (user) {
            // Use the login function which properly updates the auth state
            await login({ user: user, token: token }); // Pass both user and token
            // Navigation is handled by the login effect in AuthContext
            // navigate("/dashboard", { replace: true });
          } else {
            console.error("OAuth Error: Could not fetch user profile after getting token.");
            navigate("/login");
          }
        } catch (error) {
          console.error("OAuth Error fetching profile:", error);
          navigate("/login");
        }
      } else {
        console.error("OAuth Error: No token found in URL params.");
        navigate("/login");
      }
    };

    processOAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, login]); // Dependencies: navigate, login

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
