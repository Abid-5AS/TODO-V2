const passport = require("passport");
const { BadRequestError, AppError } = require("../../utils/errorHandler");
const asyncHandler = require("../../utils/asyncHandler");
const authService = require("../services/authService");
const { generateToken } = require("../helpers/authHelpers");
const { DEFAULT_CLIENT_URL, ERROR_MESSAGES } = require("../constants");

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new BadRequestError(ERROR_MESSAGES.MISSING_SIGNUP_FIELDS);
  }

  const user = await authService.registerUser(name, email, password);

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

  if (!email || !password) {
    throw new BadRequestError(ERROR_MESSAGES.MISSING_SIGNIN_FIELDS);
  }

  const user = await authService.loginUser(email, password);

  const token = generateToken(user._id || user.id); // Use user.id if _id not present
  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
    },
  });
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = (req, res, next) => {
  // Middleware handles fetching user data
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
  passport.authenticate("google", {
    failureRedirect: process.env.CLIENT_URL
      ? `${process.env.CLIENT_URL}/login?error=google_auth_failed`
      : `${DEFAULT_CLIENT_URL}/login?error=google_auth_failed`, // Use constant
    session: false,
  }),
  (req, res, next) => {
    try {
      const token = authService.handleGoogleLogin(req.user);
      const redirectUrl = process.env.CLIENT_URL || DEFAULT_CLIENT_URL;
      res.redirect(`${redirectUrl}/oauth-success?token=${token}`);
    } catch (err) {
      next(err);
    }
  },
];
