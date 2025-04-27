// src/features/projects/services/projectService.js
// Contains functions for project-related API calls.

import axiosInstance from '../../../api/axiosInstance';

export const getProjects = async () => {
  try {
    const response = await axiosInstance.get('/api/projects');
    // Ensure data is always an array, even if the backend sends null/undefined on no projects
    const data = Array.isArray(response.data.data) ? response.data.data : [];
    return { ...response.data, data }; 
  } catch (error) {
    console.error("Get Projects API error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || error.message || 'Failed to fetch projects.' };
  }
};

export const initializeProjects = async () => {
    try {
        const response = await axiosInstance.post('/api/projects/initialize');
        return response.data; // { success: boolean, message: string, data?: { created: Project[] } }
    } catch (error) {
        console.error("Initialize Projects API error:", error.response?.data || error.message);
        return { success: false, error: error.response?.data?.message || error.message || 'Failed to initialize projects.' };
    }
};

export const createProject = async (projectData) => {
  try {
    const response = await axiosInstance.post('/api/projects', projectData);
    return response.data; // { success: boolean, data: Project, message?: string }
  } catch (error) {
    console.error("Create Project API error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || error.message || 'Failed to create project.' };
  }
};

export const deleteProject = async (projectId) => {
  try {
    const response = await axiosInstance.delete(`/api/projects/${projectId}`);
    return response.data; // { success: boolean, message?: string }
  } catch (error) {
    console.error(`Delete Project (${projectId}) API error:`, error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || error.message || 'Failed to delete project.' };
  }
};

export const deleteProjectByName = async (projectName) => {
    // Note: Deleting by name might be less reliable if names aren't unique.
    // Prefer deleting by ID if possible.
    try {
      const response = await axiosInstance.delete(`/api/projects/name/${encodeURIComponent(projectName)}`);
      return response.data; // { success: boolean, message?: string }
    } catch (error) {
      console.error(`Delete Project by Name (${projectName}) API error:`, error.response?.data || error.message);
      return { success: false, error: error.response?.data?.message || error.message || 'Failed to delete project by name.' };
    }
};

// Add other project-related API functions here (e.g., updateProject)
