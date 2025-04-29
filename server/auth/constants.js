const JWT_EXPIRATION = "30d";
const DEFAULT_CLIENT_URL = "http://localhost:5173";

const ERROR_MESSAGES = {
  MISSING_SIGNUP_FIELDS: "Please provide name, email, and password",
  USER_EXISTS: "User already exists",
  MISSING_SIGNIN_FIELDS: "Please provide email and password",
  INVALID_CREDENTIALS: "Invalid credentials",
  GOOGLE_AUTH_FAILED: "Authentication failed after Google callback.",
  JWT_SECRET_MISSING: "JWT Secret not configured",
};

module.exports = {
  JWT_EXPIRATION,
  DEFAULT_CLIENT_URL,
  ERROR_MESSAGES,
};
