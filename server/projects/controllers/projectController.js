const { AppError, BadRequestError } = require("../../utils/errorHandler");
const asyncHandler = require("../../utils/asyncHandler");
const projectService = require("../services/projectService");
const { ERROR_MESSAGES } = require("../constants");

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
exports.getProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.findProjectsByUser(req.user._id);
  res.json({ success: true, data: projects });
});

// @desc    Create a new project
// @route   POST /api/projects
// @access  Public
exports.createProject = asyncHandler(async (req, res) => {
  const { name, description, color } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new BadRequestError(ERROR_MESSAGES.PROJECT_NAME_REQUIRED);
  }

  const project = await projectService.createProject({ name, description, color }, req.user._id);

  res.status(201).json({
    success: true,
    data: project,
    message: `Project "${project.name}" created successfully`,
  });
});

// @desc    Get a project by ID
// @route   GET /api/projects/:id
// @access  Public
exports.getProject = asyncHandler(async (req, res) => {
  // Note: This finds any project by ID, not restricted to user.
  // Consider adding user check if necessary: await projectService.findProjectByIdAndUser(req.params.id, req.user._id);
  const project = await projectService.findProjectById(req.params.id);
  res.json({ success: true, data: project });
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Public
exports.updateProject = asyncHandler(async (req, res) => {
  const { name, description, color, position, oldName } = req.body;
  const updateData = {};

  if (name !== undefined) updateData.name = name; // Service handles trimming
  if (description !== undefined) updateData.description = description;
  if (color !== undefined) updateData.color = color;
  if (position !== undefined) updateData.position = position;
  updateData.updatedAt = Date.now(); // Keep timestamp update logic here?

  const project = await projectService.updateProjectById(req.params.id, updateData, oldName, req.user._id);

  res.json({
    success: true,
    data: project,
    message: `Project "${project.name}" updated successfully`,
  });
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Public
exports.deleteProject = asyncHandler(async (req, res) => {
  const project = await projectService.findProjectById(req.params.id);
  
  // Authorization check: Ensure project belongs to the user
  if (project.user.toString() !== req.user._id.toString()) {
      throw new AppError("Not authorized to delete this project", 403);
  }

  const deletedTasksCount = await projectService.deleteProject(project);

  res.json({
    success: true,
    message: `Project "${project.name}" and ${deletedTasksCount} associated tasks deleted successfully`,
  });
});

// @desc    Delete a project by name
// @route   DELETE /api/projects/name/:projectName
// @access  Public
exports.deleteProjectByName = asyncHandler(async (req, res) => {
  const { projectName } = req.params;

  if (!projectName) {
    throw new BadRequestError(ERROR_MESSAGES.PROJECT_NAME_REQUIRED);
  }

  // Find project by name *for the specific user*
  const project = await projectService.findProjectByName(projectName, req.user._id);

  const deletedTasksCount = await projectService.deleteProject(project);

  res.json({
    success: true,
    message: `Project "${projectName}" and ${deletedTasksCount} associated tasks deleted successfully`,
  });
});

// @desc    Initialize projects from existing tasks
// @route   POST /api/projects/initialize
// @access  Public
exports.initializeProjects = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_AUTHENTICATED, 401);
  }

  const results = await projectService.initializeDefaultProjects(req.user._id);

  res.json({
    success: true,
    message: `${
      results.filter((r) => r.status === "created").length
    } projects created, ${
      results.filter((r) => r.status === "existing").length
    } already existed or updated`,
    data: results,
  });
});
