const VALID_PRAYER_LOG_STATUSES = ["completed", "missed", "excused"];
const REQUIRED_PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const ERROR_MESSAGES = {
  USER_NOT_AUTHENTICATED: "User not authenticated",
  MISSING_PRAYER_DATE_OR_NAME: "Missing prayer_date or prayer_name",
  PRAYER_LOG_DELETE_SUCCESS: "Prayer log entry deleted.",
  PRAYER_LOG_DELETE_NOT_FOUND: "No prayer log entry found to delete.",
  PRAYER_LOG_CONFLICT:
    "Conflict: Prayer log entry might already exist (concurrent update issue).",
  SERVER_ERROR_LOGGING_PRAYER: "Server error logging prayer",
  MISSING_DATE_QUERY: "Missing date query parameter",
  SERVER_ERROR_FETCHING_DAILY: "Server error fetching daily logs",
  INVALID_MONTH_QUERY: "Invalid or missing month query parameter (YYYY-MM)",
  SERVER_ERROR_FETCHING_CALENDAR: "Server error fetching calendar data",
  SERVER_ERROR_CALCULATING_STATS: "Server error calculating prayer stats",
};

module.exports = {
  VALID_PRAYER_LOG_STATUSES,
  REQUIRED_PRAYERS,
  ERROR_MESSAGES,
};
