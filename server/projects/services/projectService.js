const Project = require("../models/Project");
const Task = require("../../tasks/models/Task");
const { AppError, NotFoundError, BadRequestError } = require("../../utils/errorHandler");
const { DEFAULT_PROJECTS, ERROR_MESSAGES } = require("../constants");

/**
 * Find all projects belonging to a user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} - The projects belonging to the user
 */
exports.findProjectsByUser = async (userId) => {
  return await Project.find({ user: userId }).sort({ position: 1, createdAt: 1 });
};

/**
 * Create a new project
 * @param {Object} projectData - The project data (name, description, color)
 * @param {string} userId - The ID of the user creating the project
 * @returns {Promise<Object>} - The created project
 */
exports.createProject = async (projectData, userId) => {
  const { name, description, color } = projectData;
  
  // Check if project name already exists for this user
  const existingProject = await Project.findOne({ 
    name: name.trim(), 
    user: userId 
  });
  
  if (existingProject) {
    throw new BadRequestError(`Project with name "${name.trim()}" already exists`);
  }
  
  // Find the highest position to place new project at the end
  const highestPositionProject = await Project.findOne({ user: userId })
    .sort({ position: -1 })
    .limit(1);
  
  const position = highestPositionProject ? highestPositionProject.position + 1 : 0;
  
  // Create and return the new project
  return await Project.create({
    name: name.trim(),
    description: description || "",
    color: color || "#808080", // Default gray if no color provided
    position,
    user: userId
  });
};

/**
 * Find a project by its ID
 * @param {string} projectId - The ID of the project to find
 * @returns {Promise<Object>} - The project
 */
exports.findProjectById = async (projectId) => {
  const project = await Project.findById(projectId);
  
  if (!project) {
    throw new NotFoundError(`Project with ID ${projectId} not found`);
  }
  
  return project;
};

/**
 * Find a project by name for a specific user
 * @param {string} projectName - Name of the project to find
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} - The project
 */
exports.findProjectByName = async (projectName, userId) => {
  const project = await Project.findOne({ 
    name: projectName.trim(), 
    user: userId 
  });
  
  if (!project) {
    throw new NotFoundError(`Project "${projectName}" not found`);
  }
  
  return project;
};

/**
 * Update a project by its ID
 * @param {string} projectId - The ID of the project to update
 * @param {Object} updateData - The data to update the project with
 * @param {string} oldName - The old name of the project (for reference)
 * @param {string} userId - The ID of the user updating the project
 * @returns {Promise<Object>} - The updated project
 */
exports.updateProjectById = async (projectId, updateData, oldName, userId) => {
  const project = await this.findProjectById(projectId);
  
  // Authorization check
  if (project.user.toString() !== userId.toString()) {
    throw new AppError("Not authorized to update this project", 403);
  }
  
  // If name is being updated and is different from the old name
  if (updateData.name && updateData.name !== oldName) {
    // Check if the new name conflicts with an existing project
    const existingProject = await Project.findOne({ 
      name: updateData.name.trim(), 
      user: userId,
      _id: { $ne: projectId } // Exclude current project from check
    });
    
    if (existingProject) {
      throw new BadRequestError(`Project with name "${updateData.name.trim()}" already exists`);
    }
    
    // Update name in associated tasks
    await Task.updateMany(
      { project: oldName, user: userId },
      { $set: { project: updateData.name.trim() } }
    );
  }
  
  // Update the project
  const updatedProject = await Project.findByIdAndUpdate(
    projectId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
  
  return updatedProject;
};

/**
 * Delete a project and its associated tasks
 * @param {Object} project - The project to delete
 * @returns {Promise<number>} - Number of deleted tasks
 */
exports.deleteProject = async (project) => {
  // Delete associated tasks
  const deleteTasksResult = await Task.deleteMany({ 
    project: project.name, 
    user: project.user 
  });
  
  // Delete the project
  await Project.findByIdAndDelete(project._id);
  
  return deleteTasksResult.deletedCount || 0;
};

/**
 * Initialize default projects for a user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} - Results of the initialization
 */
exports.initializeDefaultProjects = async (userId) => {
  const results = [];
  
  // Get unique project names from user's existing tasks
  const uniqueProjectsFromTasks = await Task.distinct("project", { user: userId });
  
  // Create both default projects and projects from tasks
  const projectsToCreate = [
    ...DEFAULT_PROJECTS,
    ...uniqueProjectsFromTasks.map(name => ({ name }))
  ];
  
  // Find highest position to add new projects after
  const highestPositionProject = await Project.findOne({ user: userId })
    .sort({ position: -1 })
    .limit(1);
    
  let nextPosition = highestPositionProject ? highestPositionProject.position + 1 : 0;
  
  // Process each project
  for (const projectData of projectsToCreate) {
    // Skip empty project names
    if (!projectData.name || projectData.name.trim() === "") {
      continue;
    }
    
    const normalizedName = projectData.name.trim();
    
    // Check if project already exists
    const existingProject = await Project.findOne({
      name: normalizedName,
      user: userId
    });
    
    if (existingProject) {
      // Project exists, just add to results
      results.push({
        name: normalizedName,
        status: "existing",
        message: "Project already exists"
      });
    } else {
      // Create new project
      try {
        await Project.create({
          name: normalizedName,
          description: projectData.description || "",
          color: projectData.color || "#808080", // Default gray
          position: nextPosition++,
          user: userId
        });
        
        results.push({
          name: normalizedName,
          status: "created",
          message: "Project created successfully"
        });
      } catch (error) {
        results.push({
          name: normalizedName,
          status: "error",
          message: error.message
        });
      }
    }
  }
  
  return results;
}; 