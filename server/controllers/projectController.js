const Project = require("../models/Project");
const Task = require("../models/Task");
const { AppError } = require("../utils/errorHandler");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
exports.getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ user: req.user._id }).sort({
    position: 1,
    name: 1,
  });
  res.json({ success: true, data: projects });
});

// @desc    Create a new project
// @route   POST /api/projects
// @access  Public
exports.createProject = asyncHandler(async (req, res) => {
  const { name, description, color } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new AppError("Project name is required", 400);
  }

  // Check if project with this name already exists for this user
  const existingProject = await Project.findOne({
    name: name.trim(),
    user: req.user._id,
  });
  if (existingProject) {
    throw new AppError("A project with this name already exists", 400);
  }

  // Get the highest position for this user
  const highestPosition = await Project.findOne({ user: req.user._id }).sort(
    "-position"
  );
  const position = highestPosition ? highestPosition.position + 1 : 0;

  const project = await Project.create({
    name: name.trim(),
    description: description || "",
    color: color || "",
    position,
    isDefault: false,
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    data: project,
    message: `Project "${name}" created successfully`,
  });
});

// @desc    Get a project by ID
// @route   GET /api/projects/:id
// @access  Public
exports.getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  res.json({ success: true, data: project });
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Public
exports.updateProject = asyncHandler(async (req, res) => {
  const { name, description, color, position } = req.body;
  const updateData = {};

  if (name !== undefined) updateData.name = name.trim();
  if (description !== undefined) updateData.description = description;
  if (color !== undefined) updateData.color = color;
  if (position !== undefined) updateData.position = position;

  updateData.updatedAt = Date.now();

  // Check if updating name and if it conflicts with existing project
  if (name) {
    const existingProject = await Project.findOne({
      name: name.trim(),
      _id: { $ne: req.params.id }, // Exclude the current project
    });

    if (existingProject) {
      throw new AppError("A project with this name already exists", 400);
    }
  }

  const project = await Project.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  // If the project name changed, update all tasks with the old project name
  if (name && req.body.oldName && req.body.oldName !== name) {
    await Task.updateMany(
      { project: req.body.oldName },
      { project: name.trim() }
    );
  }

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
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  // Don't allow deletion of default projects
  if (project.isDefault) {
    throw new AppError("Cannot delete default projects", 400);
  }

  // Delete all tasks in this project
  const tasksDeleteResult = await Task.deleteMany({ project: project.name });
  const deletedTasksCount = tasksDeleteResult.deletedCount;

  // Delete the project
  await Project.findByIdAndDelete(req.params.id);

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
    throw new AppError("Project name is required", 400);
  }

  // First find the project to check if it exists and if it's a default project
  const project = await Project.findOne({ name: projectName });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  // Don't allow deletion of default projects
  if (project.isDefault) {
    throw new AppError("Cannot delete default projects", 400);
  }

  // Delete all tasks in this project
  const tasksDeleteResult = await Task.deleteMany({ project: projectName });
  const deletedTasksCount = tasksDeleteResult.deletedCount;

  // Delete the project
  await Project.findByIdAndDelete(project._id);

  res.json({
    success: true,
    message: `Project "${projectName}" and ${deletedTasksCount} associated tasks deleted successfully`,
  });
});

// @desc    Initialize projects from existing tasks
// @route   POST /api/projects/initialize
// @access  Public
exports.initializeProjects = asyncHandler(async (req, res) => {
  // Ensure user is authenticated and has an ID
  if (!req.user || !req.user._id) {
    throw new AppError("User not authenticated", 401);
  }

  // Get distinct project names from tasks for this user
  const distinctProjects = await Task.distinct("project", { user: req.user._id });

  // Initialize default projects if they don't exist
  const defaultProjects = ["Inbox"];

  const allProjects = [...new Set([...defaultProjects, ...distinctProjects])];

  // Create projects for each unique name
  const results = [];
  let position = 0;

  for (const projectName of allProjects) {
    if (!projectName) continue; // Skip empty project names

    // Check if project already exists for this user
    const existingProject = await Project.findOne({ 
      name: projectName,
      user: req.user._id 
    });

    if (!existingProject) {
      // Create new project
      const isDefault = defaultProjects.includes(projectName);
      const newProject = await Project.create({
        name: projectName,
        position: position++,
        isDefault,
        updatedAt: new Date(),
        user: req.user._id // Add the user field
      });

      results.push({
        name: newProject.name,
        id: newProject._id,
        status: "created",
      });
    } else {
      // Update existing project if needed
      const isDefault = defaultProjects.includes(projectName);
      if (existingProject.isDefault !== isDefault) {
        existingProject.isDefault = isDefault;
        await existingProject.save();
      }

      results.push({
        name: existingProject.name,
        id: existingProject._id,
        status: "existing",
      });
    }
  }

  res.json({
    success: true,
    message: `${
      results.filter((r) => r.status === "created").length
    } projects created, ${
      results.filter((r) => r.status === "existing").length
    } already existed`,
    data: results,
  });
});
