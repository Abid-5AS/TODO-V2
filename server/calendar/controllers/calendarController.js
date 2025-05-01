const asyncHandler = require("../../utils/asyncHandler");
const calendarService = require("../services/calendarService");
const { BadRequestError } = require("../../utils/errorHandler");
const { AppError } = require("../../utils/errorHandler");

// @desc    Exchange Google OAuth code for calendar tokens
// @route   POST /api/calendar/exchange-code
// @access  Private
exports.exchangeCalendarCode = asyncHandler(async (req, res, next) => {
  // Log the user object received from the middleware
  console.log("[/api/calendar/exchange-code] Received req.user:", req.user);

  const { code } = req.body;
  // Access the ID using ._id from the Mongoose object
  const userId = req.user?._id;

  // Add extra check here for debugging
  if (!userId) {
    console.error("[/api/calendar/exchange-code] CRITICAL: userId is missing from req.user! Could not find ._id");
    // You might want to return an error here instead of proceeding
    return next(new AppError("Authentication error: User ID not found.", 500));
  }

  if (!code) {
    throw new BadRequestError("Authorization code is required.");
  }

  // The service handles token exchange, user lookup, and saving
  await calendarService.exchangeCodeAndSaveTokens(userId, code);

  res.status(200).json({ success: true, message: "Google Calendar connected successfully." });
});

// TODO: Add controller for creating events
// exports.createEvent = asyncHandler(async (req, res, next) => { ... }); 