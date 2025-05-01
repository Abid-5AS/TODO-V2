const User = require("../../auth/models/User"); // Adjust path as needed
const { AppError } = require("../../utils/errorHandler");
const { getAuthenticatedClient, createGoogleCalendarEvent } = require("../helpers/googleCalendarHelper");
require("dotenv").config();

// Keep the function for the initial OAuth code exchange
exports.exchangeCodeAndSaveTokens = async (userId, code) => {
  // This function needs access to the oauth2Client defined in the helper
  // For simplicity now, we might redefine it here or pass it
  // Let's re-import google and create the client just for this function
  // NOTE: This isn't ideal, passing the client or having a shared config is better
  // but this avoids larger refactoring for now.
  const { google } = require("googleapis");
  const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.API_BASE_URL || 'http://localhost:5001'}/api/auth/google/calendar/callback`
  );

  try {
    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    const { access_token, refresh_token, expiry_date, scope } = tokens;

    console.log("Received scopes:", scope);
    console.log("Received refresh token:", !!refresh_token);

    if (!access_token) {
      throw new AppError("Failed to retrieve access token from Google.", 500);
    }
    if (!scope || !scope.includes("https://www.googleapis.com/auth/calendar.events")) {
      console.warn("Calendar scope was not granted by the user.");
      throw new AppError("Required Google Calendar permission was not granted.", 403);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found for saving Google Calendar tokens.", 404);
    }

    user.googleCalendarAccessToken = access_token;
    if (refresh_token) {
      user.googleCalendarRefreshToken = refresh_token;
    }
    user.googleCalendarTokenExpiry = expiry_date ? new Date(expiry_date) : null;
    user.isCalendarConnected = true;

    await user.save();
    console.log(`Successfully saved Google Calendar tokens for user ${userId}`);

  } catch (error) {
    console.error(`Error exchanging Google Calendar code for user ${userId}:`, error.response?.data || error.message || error);
    if (error.response?.data?.error === 'invalid_grant') {
      throw new AppError("Invalid authorization code or token has expired. Please try connecting again.", 401);
    }
    if (error instanceof AppError) throw error;
    throw new AppError(`Google Calendar connection failed: ${error.message}`, 500);
  }
};

/**
 * Attempts to add a task as an event to the user's Google Calendar.
 * Fails silently (logs error) if calendar is not connected or event creation fails.
 * @param {string} userId - The ID of the user.
 * @param {object} taskData - Data of the task being created.
 * @param {string} taskData.title - Title of the task.
 * @param {string} [taskData.description] - Description of the task.
 * @param {Date} [taskData.dueDate] - Due date of the task.
 */
exports.addEventToCalendar = async (userId, taskData) => {
  console.log(`Attempting to add event to calendar for user ${userId}`);
  try {
    const authClient = await getAuthenticatedClient(userId);

    if (!authClient) {
      console.log(`User ${userId} calendar not connected or token refresh failed. Skipping event creation.`);
      return; // Silently exit if not connected or tokens invalid
    }

    // Basic validation: We need a title and a due date for a calendar event
    if (!taskData.title || !taskData.dueDate) {
      console.warn("Task missing title or due date, cannot create calendar event.");
      return;
    }

    // Format event details for Google Calendar API
    // Assuming dueDate is a JavaScript Date object. Adjust if it's a string.
    const startDateTime = taskData.dueDate.toISOString();
    // Set a default duration (e.g., 1 hour) if no specific end time is available
    const endDateTime = new Date(taskData.dueDate.getTime() + 60 * 60 * 1000).toISOString();

    const eventDetails = {
      summary: taskData.title,
      description: taskData.description || 'Added from To-Do App',
      startDateTime: startDateTime,
      endDateTime: endDateTime,
      // timeZone: 'user_timezone' // Optional: Get user's timezone if stored
    };

    await createGoogleCalendarEvent(authClient, eventDetails);
    console.log(`Successfully queued event creation for task "${taskData.title}" for user ${userId}`);

  } catch (error) {
    // Log the error but don't block the main task creation flow
    console.error(`Failed to add event to Google Calendar for user ${userId}:`, error.message);
    // Depending on the error, might want to disconnect calendar if auth fails repeatedly
    if (error.message.includes("token has been expired or revoked")) {
        // Handle revoked access - maybe disconnect user's calendar
        const user = await User.findById(userId);
        if(user) {
            user.isCalendarConnected = false;
            user.googleCalendarAccessToken = undefined;
            user.googleCalendarRefreshToken = undefined;
            user.googleCalendarTokenExpiry = undefined;
            await user.save();
            console.warn(`Disconnected Google Calendar for user ${userId} due to revoked token.`);
        }
    }
  }
};

// TODO: Add function to get a valid access token (using refresh token if needed)
// exports.getValidAccessToken = async (userId) => { ... };

// TODO: Add function to create calendar event
// exports.createCalendarEvent = async (userId, eventDetails) => { ... }; 