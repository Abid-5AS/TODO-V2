// src/features/auth/components/SignupPage.jsx
// Renders the signup form and handles signup logic.

import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useActionState } from "react";
import { motion } from "framer-motion";

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [state, formAction, isPending] = useActionState(
    async (previousState, formData) => {
      const result = await signup(Object.fromEntries(formData));
      // No navigation here, handled by useEffect
      return result; // Return result from signup action
    },
    { success: false, error: null } // Initial state
  );

  useEffect(() => {
    if (state.success) {
      console.log("Signup successful, navigating to dashboard...");
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
        <div className="absolute -top-[5%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-[50%] -left-[5%] w-[30%] h-[30%] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -bottom-[5%] right-[20%] w-[50%] h-[30%] rounded-full bg-primary/5 blur-3xl" />
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
            Create Account
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
              <label className="block mb-2 font-medium text-sm">Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-700 dark:border-gray-600 transition-all duration-200"
                  placeholder="Your name"
                />
              </div>
            </motion.div>

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
                  minLength={6}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-700 dark:border-gray-600 transition-all duration-200"
                  placeholder="••••••••"
                />
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Must be at least 6 characters
                </div>
              </div>
            </motion.div>

            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              type="submit"
              disabled={isPending}
              className="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium shadow-md shadow-primary/20 mt-2"
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
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </motion.button>
          </motion.form>

          <motion.div
            variants={itemVariants}
            className="mt-6 text-center text-sm"
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary hover:text-primary/80 font-medium hover:underline transition-all duration-200"
            >
              Sign In
            </Link>
          </motion.div>

          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
