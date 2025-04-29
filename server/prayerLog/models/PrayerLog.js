const mongoose = require("mongoose");

const prayerLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming you have a User model
    required: true,
    index: true,
  },
  prayer_date: {
    type: Date, // Store as Date object, representing the start of the day in UTC
    required: true,
    index: true,
  },
  prayer_name: {
    type: String,
    required: true,
    enum: ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"],
    index: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["Completed", "Missed", "Excused"],
    default: "Completed",
  },
  // Add timestamps for record creation/update
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Ensure timestamps are updated on modification
prayerLogSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

// Compound index for efficient querying of user's logs for a specific prayer on a specific date
prayerLogSchema.index(
  { user_id: 1, prayer_date: 1, prayer_name: 1 },
  { unique: true },
);

const PrayerLog = mongoose.model("PrayerLog", prayerLogSchema);

module.exports = PrayerLog;
