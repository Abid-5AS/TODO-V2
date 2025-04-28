// src/features/dashboard/services/dashboardService.js
// Service functions for the dashboard feature

import { getProjects, createProject, deleteProject, deleteProjectByName, initializeProjects } from '../../projects/services/projectService';
import { getAppearanceSettings } from '../../settings/services/appearanceSettingsService';

/**
 * Fetches all projects for the dashboard
 * @returns {Promise<Object>} - The projects data
 */
export const fetchProjects = async () => {
  try {
    let response = await getProjects();

    if (!response || !response.success || (response.success && response.data.length === 0)) {
      console.log("No projects found or fetch failed, attempting initialization...");
      const initResponse = await initializeProjects();
      if (initResponse.success) {
        response = await getProjects(); // Re-fetch after initialization
        return {
          success: true,
          data: response.data,
          message: "Projects initialized successfully"
        };
      } else {
        throw new Error(initResponse.error || "Failed to initialize projects");
      }
    }

    return response;
  } catch (error) {
    console.error("Error loading or initializing projects:", error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

/**
 * Creates a new project
 * @param {Object} projectData - The project data
 * @returns {Promise<Object>} - The created project
 */
export const createNewProject = async (projectData) => {
  try {
    const response = await createProject(projectData);
    return response;
  } catch (error) {
    console.error("Error creating project:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Deletes a project
 * @param {string} projectId - The project ID
 * @returns {Promise<Object>} - The deletion result
 */
export const deleteProjectById = async (projectId) => {
  try {
    const response = await deleteProject(projectId);
    return response;
  } catch (error) {
    console.error("Error deleting project:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Deletes a project by name
 * @param {string} projectName - The project name
 * @returns {Promise<Object>} - The deletion result
 */
export const deleteProjectByNameService = async (projectName) => {
  try {
    const response = await deleteProjectByName(projectName);
    return response;
  } catch (error) {
    console.error("Error deleting project by name:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Fetches appearance settings
 * @returns {Promise<Object>} - The appearance settings
 */
export const fetchAppearanceSettings = async () => {
  try {
    const { settings } = await getAppearanceSettings();
    return {
      success: true,
      data: settings
    };
  } catch (error) {
    console.error("Error loading appearance settings:", error);
    return {
      success: false,
      error: error.message
    };
  }
}; 