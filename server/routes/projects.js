const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  deleteProjectByName,
  initializeProjects,
} = require("../controllers/projectController");

// Protect all project routes
router.use(authenticateToken);

// Get all projects and create a new project
router.route("/").get(getProjects).post(createProject);

// Initialize projects from tasks
router.post("/initialize", initializeProjects);

// Get, update and delete project by ID
router.route("/:id").get(getProject).put(updateProject).delete(deleteProject);

// Delete project by name (for backward compatibility)
router.delete("/name/:projectName", deleteProjectByName);

module.exports = router;
