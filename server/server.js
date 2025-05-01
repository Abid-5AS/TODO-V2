const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const session = require("express-session");
const passport = require("passport");
require("./config/passport");
const { globalErrorHandler } = require("./utils/errorHandler");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();

// --- Middleware ---
// Enable CORS (Cross-Origin Resource Sharing)
// Configure CORS properly for production later (e.g., restrict origin)
app.use(cors());

// Body Parser Middleware (for parsing JSON request bodies)
app.use(express.json());
// Body Parser Middleware (for parsing URL-encoded request bodies)
app.use(express.urlencoded({ extended: false }));

// Enable sessions (required for passport, even if session: false for JWT)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);
app.use(passport.initialize());
app.use(passport.session());

// --- Basic Route for Testing ---
app.get("/", (req, res) => {
  res.send("API is running...");
});

// --- Mount Routers ---
const prayerLogRoutes = require('./prayerLog/routes/prayerLogRoutes');
const locationRoutes = require('./location/routes/locationRoutes');
const calendarRoutes = require('./calendar/routes/calendarRoutes');
app.use("/api/auth", require("./auth/routes/authRoutes"));
app.use("/api/tasks", require("./tasks/routes/taskRoutes"));
app.use("/api/ai", require("./ai/routes/aiRoutes"));
app.use("/api/projects", require("./projects/routes/projectRoutes"));
app.use('/api/prayer-logs', prayerLogRoutes);
app.use('/api/location', locationRoutes);
app.use("/api/calendar", calendarRoutes);

// --- Global Error Handler ---
// Replace the old generic handler with the new one
app.use(globalErrorHandler);

// --- Start Server ---
const PORT = process.env.PORT || 5001; // Use port from .env or default to 5001

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  )
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1)); // Consider if needed, can cause abrupt stops
});
