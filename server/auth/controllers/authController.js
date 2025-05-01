const passport = require("passport");
const { google } = require("googleapis"); // Import googleapis
const User = require("../models/User"); // Import User model
const { BadRequestError, AppError } = require("../../utils/errorHandler");
const asyncHandler = require("../../utils/asyncHandler");
const authService = require("../services/authService");
const { generateToken } = require("../helpers/authHelpers");
const { DEFAULT_CLIENT_URL, ERROR_MESSAGES } = require("../constants");
require("dotenv").config(); // Ensure dotenv is configured

// Configure the Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  // IMPORTANT: Use the specific callback URL for calendar connection
  `${process.env.API_BASE_URL || 'http://localhost:5001'}/api/auth/google/calendar/callback`
);

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

// @desc    Initiate Google OAuth flow for LOGIN/SIGNUP
// @route   GET /api/auth/google
// @access  Public
exports.googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"], // Only profile and email for login
  accessType: "offline", // Request refresh token for login too, might be useful
  prompt: "consent", // Optional: always prompt for consent on login
});

// @desc    Handle Google OAuth callback for LOGIN/SIGNUP
// @route   GET /api/auth/google/callback
// @access  Public
exports.googleCallback = [
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL || DEFAULT_CLIENT_URL}/login?error=google_auth_failed`,
    session: false,
  }),
  (req, res, next) => {
    try {
      // req.user is populated by passport's GoogleStrategy
      if (!req.user) {
        throw new AppError(ERROR_MESSAGES.GOOGLE_AUTH_FAILED, 500);
      }
      // Generate *login* token (no calendar tokens saved here)
      const token = authService.handleGoogleLogin(req.user);
      const redirectUrl = process.env.CLIENT_URL || DEFAULT_CLIENT_URL;
      res.redirect(`${redirectUrl}/oauth-success?token=${token}`);
    } catch (err) {
      next(err);
    }
  },
];

// --- Google Calendar Connection Controllers ---

// @desc    Initiate Google OAuth flow for CALENDAR CONNECTION
// @route   GET /api/auth/google/calendar/connect
// @access  Private (requires user logged in)
exports.connectGoogleCalendar = asyncHandler(async (req, res, next) => {
  const scopes = [
    "https://www.googleapis.com/auth/calendar.events", // Scope to create/edit events
    "https://www.googleapis.com/auth/userinfo.profile", // Keep profile
    "https://www.googleapis.com/auth/userinfo.email", // Keep email
  ];

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: "offline", // Crucial to get a refresh token
    scope: scopes,
    prompt: "consent", // Force prompt to ensure user grants calendar scope
    // We don't strictly need state here if using protect middleware,
    // but it's good practice for CSRF protection.
    // state: req.user.id, // Optional: Pass user ID as state
  });

  res.redirect(authorizationUrl);
});

// @desc    Handle Google OAuth callback for CALENDAR CONNECTION
// @route   GET /api/auth/google/calendar/callback
// @access  Public (Middleware removed from route definition)
exports.googleCalendarCallback = asyncHandler(async (req, res, next) => {
  const { code, error } = req.query; // Get the authorization code or error

  const clientUrl = process.env.CLIENT_URL || DEFAULT_CLIENT_URL;
  const frontendCallbackPath = "/oauth/calendar/callback"; // New frontend route

  if (error) {
    console.error("Google OAuth Error on callback:", error);
    // Redirect to frontend with error indication
    res.redirect(`${clientUrl}${frontendCallbackPath}?error=google_error`);
    return;
  }

  if (!code) {
    // Redirect to frontend indicating code is missing
    res.redirect(`${clientUrl}${frontendCallbackPath}?error=code_missing`);
    return;
  }

  // Redirect to the new frontend callback route, passing the code
  res.redirect(`${clientUrl}${frontendCallbackPath}?code=${code}`);
});
