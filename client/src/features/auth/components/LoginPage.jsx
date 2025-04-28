// src/features/auth/components/LoginPage.jsx
// Renders the login form and handles login logic.

import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useActionState } from "react";
import { motion } from "framer-motion";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [state, formAction, isPending] = useActionState(
    async (previousState, formData) => {
      const result = await login(Object.fromEntries(formData));
      // No navigation here, handled by useEffect
      return result; // Return the result from login action
    },
    { success: false, error: null } // Initial state
  );

  useEffect(() => {
    if (state.success) {
      console.log("Login successful, navigating to dashboard...");
      navigate("/dashboard", { replace: true });
    }
  }, [state.success, navigate]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.03, transition: { duration: 0.2 } },
    tap: { scale: 0.98 },
  };

  return (
    <div className="min-h-[calc(100vh-theme(space.14))] flex items-center justify-center relative overflow-hidden pt-14 bg-gradient-radial">
      {/* Animated flowing gradient background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute w-full h-full bg-gradient-to-r from-blue-600/30 via-blue-400/30 to-cyan-400/30 animate-gradient-x"></div>
        <div className="absolute w-full h-full bg-gradient-to-b from-indigo-600/20 via-blue-500/20 to-sky-400/20 animate-gradient-y"></div>
        <div className="absolute w-full h-full opacity-30">
          <div className="absolute top-1/4 left-1/4 w-1/3 h-1/3 rounded-full bg-blue-500/40 blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/3 right-1/4 w-1/3 h-1/3 rounded-full bg-blue-400/40 blur-3xl animate-blob"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1/3 h-1/3 rounded-full bg-cyan-400/40 blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md relative z-10 mb-14" /* Add bottom margin */
      >
        <motion.div
          variants={itemVariants}
          className="p-8 rounded-xl backdrop-blur-md bg-white/10 dark:bg-gray-900/20 shadow-xl border border-white/20 dark:border-gray-700/30"
          style={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent dark:from-primary dark:to-primary/80"
          >
            Welcome Back
          </motion.h2>

          {state.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 text-red-500 text-sm bg-red-50/80 dark:bg-red-900/30 rounded-lg border border-red-100/80 dark:border-red-800/50"
            >
              {state.error}
            </motion.div>
          )}

          <motion.form
            variants={itemVariants}
            action={formAction}
            className="space-y-5"
          >
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <label className="block mb-2 font-medium text-sm text-gray-800 dark:text-gray-200">Email</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 bg-white/30 dark:bg-gray-800/30 border border-white/30 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-gray-100 transition-all duration-200 placeholder-gray-500/80 dark:placeholder-gray-400/80"
                  placeholder="your@email.com"
                />
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <label className="block mb-2 font-medium text-sm text-gray-800 dark:text-gray-200">Password</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full px-4 py-3 bg-white/30 dark:bg-gray-800/30 border border-white/30 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-gray-100 transition-all duration-200 placeholder-gray-500/80 dark:placeholder-gray-400/80"
                  placeholder="••••••••"
                />
              </div>
            </motion.div>

            <motion.button
              variants={buttonVariants}
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isPending}
              className="w-full py-3 px-4 bg-primary/90 text-white rounded-lg hover:bg-primary transition-all duration-300 font-medium shadow-lg shadow-primary/20 dark:shadow-none backdrop-blur-sm mt-2"
            >
              {isPending ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </motion.form>

          <motion.div
            variants={itemVariants}
            className="relative my-6 flex items-center"
          >
            <div className="flex-grow border-t border-white/30 dark:border-gray-700/30"></div>
            <span className="flex-shrink mx-4 text-gray-600 dark:text-gray-400 text-sm">
              or continue with
            </span>
            <div className="flex-grow border-t border-white/30 dark:border-gray-700/30"></div>
          </motion.div>

          <motion.button
            variants={buttonVariants}
            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() =>
              (window.location.href = `${
                import.meta.env.VITE_API_BASE_URL || "http://localhost:5001"
              }/api/auth/google`)
            }
            className="w-full py-3 px-4 bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-white rounded-lg border border-white/30 dark:border-gray-700/30 hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all duration-200 font-medium flex items-center justify-center gap-3 shadow-lg shadow-black/5 dark:shadow-black/10 backdrop-blur-sm"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 48 48"
              className="inline-block"
            >
              <g>
                <path
                  fill="#4285F4"
                  d="M24 9.5c3.54 0 6.7 1.22 9.19 3.22l6.85-6.85C35.64 2.36 30.18 0 24 0 14.82 0 6.73 5.48 2.69 13.44l7.98 6.2C12.13 13.09 17.62 9.5 24 9.5z"
                />
                <path
                  fill="#34A853"
                  d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.6C43.98 37.36 46.1 31.45 46.1 24.55z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.67 28.65c-1.01-2.9-1.01-6.01 0-8.91l-7.98-6.2C.64 17.09 0 20.45 0 24s.64 6.91 1.69 10.46l7.98-6.2z"
                />
                <path
                  fill="#EA4335"
                  d="M24 48c6.18 0 11.64-2.05 15.52-5.59l-7.19-5.6c-2.01 1.35-4.59 2.14-8.33 2.14-6.38 0-11.87-3.59-14.33-8.85l-7.98 6.2C6.73 42.52 14.82 48 24 48z"
                />
                <path fill="none" d="M0 0h48v48H0z" />
              </g>
            </svg>
            Sign in with Google
          </motion.button>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            className="mt-6 text-center text-sm text-gray-700 dark:text-gray-300"
          >
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary hover:text-primary/80 font-medium hover:underline transition-all duration-200"
            >
              Sign Up
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
