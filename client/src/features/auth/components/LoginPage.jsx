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
    <div className="min-h-[calc(100vh-theme(space.14))] flex items-center justify-center bg-theme relative overflow-hidden pt-14">
      {" "}
      {/* Added bg-theme and relative classes */}
      {/* Background gradient elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -bottom-[5%] left-[30%] w-[50%] h-[30%] rounded-full bg-primary/5 blur-3xl" />
      </div>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md relative z-10 mb-14" /* Add bottom margin */
      >
        <motion.div
          variants={itemVariants}
          className="p-8 bg-card dark:bg-gray-800 rounded-xl shadow-lg backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80 border border-border dark:border-gray-700"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
          >
            Welcome Back
          </motion.h2>

          {state.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800"
            >
              {state.error}
            </motion.div>
          )}

          <motion.form
            variants={itemVariants}
            action={formAction}
            className="space-y-5"
          >
            <motion.div variants={itemVariants}>
              <label className="block mb-2 font-medium text-sm">Email</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-700 dark:border-gray-600 transition-all duration-200"
                  placeholder="your@email.com"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block mb-2 font-medium text-sm">Password</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-700 dark:border-gray-600 transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </motion.div>

            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              type="submit"
              disabled={isPending}
              className="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium shadow-md shadow-primary/20"
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
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
            <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">
              or continue with
            </span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
          </motion.div>

          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            type="button"
            onClick={() =>
              (window.location.href = `${
                import.meta.env.VITE_API_BASE_URL || "http://localhost:5001"
              }/api/auth/google`)
            }
            className="w-full py-3 px-4 bg-white dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 font-medium flex items-center justify-center gap-3 shadow-sm"
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
            className="mt-6 text-center text-sm"
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
