const mongoose = require("mongoose");

// Define the subtask schema separately for clarity
const SubtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Subtask title is required."],
    trim: true,
    maxlength: [250, "Subtask title cannot be more than 250 characters."],
  },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },
  // No separate createdAt needed unless specifically required for subtasks
});

const TaskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
    index: true, // Index for faster user-specific queries
  },
  title: {
    type: String,
    required: [true, "Task title is required."],
    trim: true,
    maxlength: [250, "Title cannot be more than 250 characters."],
    index: true, // Index for searching/sorting by title
  },
  description: {
    type: String,
    required: false,
    maxlength: [1000, "Description cannot be more than 1000 characters"], // Increased length
    default: "",
  },
  dueDate: {
    type: Date,
    required: false,
    index: true, // Index for sorting/filtering by due date
  },
  priority: {
    type: String,
    required: false,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
  status: {
    type: String,
    enum: ["todo", "doing", "completed"],
    default: "todo",
    index: true,
  },
  project: {
    type: String,
    trim: true,
    required: false,
    default: "Inbox", // Default project/group
    index: true, // Index for grouping/filtering
    maxlength: [50, "Project name cannot be more than 50 characters"],
  },
  labels: {
    type: [String],
    required: false,
    default: [],
  },
  subtasks: [SubtaskSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Optional: Add a text index for searching title and description
// TaskSchema.index({ title: 'text', description: 'text' });

// Indexes
TaskSchema.index({ user: 1, project: 1 });
TaskSchema.index({ user: 1, dueDate: 1 });
TaskSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model("Task", TaskSchema);
