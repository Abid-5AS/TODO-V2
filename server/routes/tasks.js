const express = require("express");
const Task = require("../models/Task");
const { authenticateToken } = require("../middleware/authMiddleware");
const {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  addSubtask,
  updateSubtask,
  deleteSubtask,
} = require("../controllers/taskController");

const router = express.Router();

router.use(authenticateToken);

// --- Route: GET /api/tasks ---
// @desc    Get all tasks for the logged-in user (optionally filter by search query)
// @access  Private
router.get("/", getTasks);

// --- Route: POST /api/tasks ---
// @desc    Create a new task for the logged-in user
// @access  Private
router.post("/", createTask);

// --- Route: GET /api/tasks/:id ---
// @desc    Get a single task by ID (includes subtasks)
// @access  Private
router.get("/:id", getTask);

// --- Route: PUT /api/tasks/:id ---
// @desc    Update a task by ID
// @access  Private
router.put("/:id", updateTask);

// --- Route: DELETE /api/tasks/:id ---
// @desc    Delete a task by ID
// @access  Private
router.delete("/:id", deleteTask);

// --- Subtask Routes ---

// Add subtask
router.post("/:taskId/subtasks", addSubtask);

// Update subtask
router.put("/:taskId/subtasks/:subtaskId", updateSubtask);

// Delete subtask
router.delete("/:taskId/subtasks/:subtaskId", deleteSubtask);

module.exports = router;
