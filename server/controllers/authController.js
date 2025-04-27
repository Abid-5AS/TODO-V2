const User = require("../models/User");
const jwt = require("jsonwebtoken");
const passport = require("passport");
require("dotenv").config(); // Ensure env vars are loaded
const {
  BadRequestError,
  UnauthorizedError,
  AppError,
} = require("../utils/errorHandler");
const asyncHandler = require("../utils/asyncHandler");

// --- Helper function to generate JWT ---
// Moved here from routes to be accessible by multiple controller functions
const generateToken = (id, extra = {}) => {
  const payload = { id, ...extra };
  if (!process.env.JWT_SECRET) {
    console.error("Fatal Error: JWT_SECRET is not defined.");
    // In a real app, you might want to throw an error that stops the server
    // or prevents login/signup until the secret is set.
    throw new Error("JWT Secret not configured");
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "30d", // Consider making this configurable
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Basic Input Validation (can be moved to middleware later)
  if (!name || !email || !password) {
    throw new BadRequestError("Please provide name, email, and password");
  }

  // Check if user already exists
  let user = await User.findOne({ email });
  if (user) {
    // Use custom error
    throw new BadRequestError("User already exists");
  }

  // Create new user (Password hashing is handled by Mongoose pre-save hook)
  // ValidationErrors (e.g., from Mongoose schema) will be caught by asyncHandler -> globalErrorHandler
  user = await User.create({
    name,
    email,
    password,
  });

  // Generate token and respond
  const token = generateToken(user._id);
  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/signin
// @access  Public
exports.signin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  // Check for user by email, explicitly select password
  // If findOne fails unexpectedly, it's caught by asyncHandler
  const user = await User.findOne({ email }).select("+password");

  // Use UnauthorizedError for authentication failures
  if (!user) {
    throw new UnauthorizedError("Invalid credentials");
  }

  // Check if password matches
  // If matchPassword fails unexpectedly, it's caught by asyncHandler
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    throw new UnauthorizedError("Invalid credentials");
  }

  // Generate token and respond
  // If generateToken fails (e.g., missing secret handled inside), it will throw
  const token = generateToken(user._id);
  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = (req, res, next) => {
  // The 'protect' middleware already fetched the user and attached it to req.user
  // If protect middleware failed, it would have already sent an error response.
  // So, if we reach here, req.user is valid.
  res.status(200).json({ success: true, user: req.user });
};

// @desc    Initiate Google OAuth flow
// @route   GET /api/auth/google
// @access  Public
exports.googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

// @desc    Handle Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
exports.googleCallback = [
  // Passport middleware first
  passport.authenticate("google", {
    failureRedirect: process.env.CLIENT_URL
      ? `${process.env.CLIENT_URL}/login?error=google_auth_failed`
      : "/login", // Redirect to frontend login on failure
    session: false,
  }),
  // Custom handler after passport auth succeeds
  (req, res, next) => {
    try {
      if (!req.user) {
        // This case *shouldn't* happen if passport.authenticate succeeds without error,
        // but check defensively.
        console.error(
          "Google OAuth Callback: No user attached after successful auth."
        );
        throw new AppError("Authentication failed after Google callback.", 500); // Use AppError
      }

      // Generate JWT for the user
      const token = generateToken(req.user._id, { photo: req.user.photo });

      // Redirect to frontend with token
      const redirectUrl = process.env.CLIENT_URL || "http://localhost:5173";
      res.redirect(`${redirectUrl}/oauth-success?token=${token}`);
    } catch (err) {
      // Catch errors during token generation or redirection
      next(err); // Forward to global error handler
    }
  },
];

// Export the helper function if needed elsewhere, otherwise keep it private
// module.exports.generateToken = generateToken; // Uncomment if needed
