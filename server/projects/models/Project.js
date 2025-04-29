const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  // Optional fields for future enhancements
  color: {
    type: String,
    default: "",
  },
  // For ordering projects in the sidebar
  position: {
    type: Number,
    default: 0,
  },
  // Will set to true for special projects like "Inbox"
  isDefault: {
    type: Boolean,
    default: false,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Project", projectSchema);
