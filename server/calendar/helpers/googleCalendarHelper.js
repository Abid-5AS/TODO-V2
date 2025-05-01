const { google } = require("googleapis");
const User = require("../../auth/models/User"); // Adjust path as needed
const { AppError } = require("../../utils/errorHandler");
require("dotenv").config();

// Centralized OAuth2 client configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  // This redirectUri is used by googleapis library during token exchange
  // and potentially during refresh token flows. It MUST match one registered in Google Cloud Console.
  `${process.env.API_BASE_URL || 'http://localhost:5001'}/api/auth/google/calendar/callback`
);

/**
 * Retrieves user's calendar tokens and returns an authenticated OAuth2 client.
 * Handles token refresh if the access token is expired.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<google.auth.OAuth2 | null>} Authenticated OAuth2 client or null if no tokens/refresh fails.
 * @throws {AppError} If user not found or critical error occurs.
 */
const getAuthenticatedClient = async (userId) => {
  const user = await User.findById(userId).select(
    "+googleCalendarAccessToken +googleCalendarRefreshToken +googleCalendarTokenExpiry isCalendarConnected"
  );

  if (!user) {
    throw new AppError("User not found for Google Calendar operation.", 404);
  }

  if (!user.isCalendarConnected || !user.googleCalendarAccessToken) {
    console.log(`User ${userId} has not connected their Google Calendar or lacks an access token.`);
    return null; // User hasn't connected or tokens are missing
  }

  oauth2Client.setCredentials({
    access_token: user.googleCalendarAccessToken,
    refresh_token: user.googleCalendarRefreshToken, // May be null if not provided/needed initially
    expiry_date: user.googleCalendarTokenExpiry?.getTime(), // Convert Date object to timestamp ms
  });

  // Check if the token is expired or close to expiring (e.g., within 5 minutes)
  const now = new Date().getTime();
  const expiryTime = user.googleCalendarTokenExpiry?.getTime() || 0;
  const fiveMinutesInMillis = 5 * 60 * 1000;

  if (expiryTime < now + fiveMinutesInMillis) {
    console.log(`Google Calendar token for user ${userId} is expired or nearing expiry. Refreshing...`);
    if (!user.googleCalendarRefreshToken) {
        console.error(`User ${userId} needs token refresh but has no refresh token.`);
        // Optional: Could attempt to disconnect the calendar connection here or notify user
        // user.isCalendarConnected = false;
        // await user.save();
        return null; // Cannot refresh without a refresh token
    }
    try {
      // Set credentials with the refresh token
      oauth2Client.setCredentials({ refresh_token: user.googleCalendarRefreshToken });
      // Refresh the access token
      const { credentials } = await oauth2Client.refreshAccessToken();
      console.log(`Successfully refreshed Google Calendar token for user ${userId}`);

      // Update the user's tokens in the database
      user.googleCalendarAccessToken = credentials.access_token;
      // Refresh token might be returned again, update if so (usually doesn't change)
      if (credentials.refresh_token) {
         user.googleCalendarRefreshToken = credentials.refresh_token;
      }
      user.googleCalendarTokenExpiry = credentials.expiry_date ? new Date(credentials.expiry_date) : null;
      
      // Save updated tokens (without necessarily setting isCalendarConnected again)
      await user.save();
      
      // Set the new credentials on the client for the current operation
      oauth2Client.setCredentials(credentials);

    } catch (refreshError) {
      console.error(`Failed to refresh Google Calendar token for user ${userId}:`, refreshError.response?.data || refreshError.message);
      // Handle specific errors like 'invalid_grant' which might mean the user revoked access
      if (refreshError.response?.data?.error === 'invalid_grant') {
          console.warn(`Refresh token invalid for user ${userId}. Disconnecting calendar.`);
          user.googleCalendarAccessToken = undefined;
          user.googleCalendarRefreshToken = undefined;
          user.googleCalendarTokenExpiry = undefined;
          user.isCalendarConnected = false;
          await user.save();
      }
      return null; // Refresh failed
    }
  }

  return oauth2Client; // Return the client, now guaranteed to have fresh credentials set
};

/**
 * Creates an event in the user's primary Google Calendar.
 * @param {google.auth.OAuth2} authClient - Authenticated OAuth2 client.
 * @param {object} eventDetails - Details of the event to create.
 * @param {string} eventDetails.summary - Event title (e.g., task title).
 * @param {string} [eventDetails.description] - Event description.
 * @param {string} eventDetails.startDateTime - ISO 8601 start time.
 * @param {string} eventDetails.endDateTime - ISO 8601 end time.
 * @param {string} [eventDetails.timeZone] - Timezone (e.g., 'America/New_York'). Defaults to user's primary calendar timezone if omitted.
 * @returns {Promise<object>} The created Google Calendar event object.
 * @throws {Error} If API call fails.
 */
const createGoogleCalendarEvent = async (authClient, eventDetails) => {
  const calendar = google.calendar({ version: "v3", auth: authClient });

  const event = {
    summary: eventDetails.summary,
    description: eventDetails.description || '', // Optional description
    start: {
      dateTime: eventDetails.startDateTime,
      timeZone: eventDetails.timeZone, // Google Calendar API handles default if omitted
    },
    end: {
      dateTime: eventDetails.endDateTime,
      timeZone: eventDetails.timeZone, // Google Calendar API handles default if omitted
    },
    // Add other desired event properties here (e.g., reminders)
    // reminders: {
    //   useDefault: false,
    //   overrides: [
    //     { method: 'popup', minutes: 10 },
    //   ],
    // },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: "primary", // Use the user's primary calendar
      resource: event,
    });
    console.log("Google Calendar event created:", response.data.htmlLink);
    return response.data;
  } catch (error) {
    console.error("Error creating Google Calendar event:", error.response?.data || error.message);
    // Throw a more specific error or handle it based on the type
    throw new Error(`Failed to create Google Calendar event: ${error.message}`);
  }
};

module.exports = {
  getAuthenticatedClient,
  createGoogleCalendarEvent,
}; 