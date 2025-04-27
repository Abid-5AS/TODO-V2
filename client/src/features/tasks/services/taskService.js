// src/features/tasks/services/taskService.js
// Contains functions for task and subtask related API calls.

import axiosInstance from '../../../api/axiosInstance';

// --- Task API Calls --- 

export const fetchTasks = async (params = {}) => {
  try {
    // Adapt the endpoint based on the 'project' parameter
    let url = '/api/tasks';
    const queryParams = new URLSearchParams();

    if (params.project) {
      const specialViews = ['today', 'upcoming', 'completed', 'all', 'inbox'];
      if (specialViews.includes(params.project)) {
         // If it's a special view, pass it as a query parameter
         queryParams.append('view', params.project);
      } else {
          // Otherwise, assume it's a specific project name/ID
          queryParams.append('project', params.project);
      }
    } else {
        // Default to 'today' if no project specified?
        // queryParams.append('view', 'today');
        // Or fetch all if no project is specified? Backend needs to handle this.
    }

    // Add other potential query params like search, sort, filter if handled backend-side
    // if (params.search) queryParams.append('search', params.search);
    // if (params.sort) queryParams.append('sort', params.sort);
    // if (params.filter) queryParams.append('filter', params.filter);

    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    console.log(`[taskService] Fetching tasks from: ${url}`);
    const response = await axiosInstance.get(url);
    return response.data; // Expecting { success: boolean, data: Task[], message?: string }
  } catch (error) {
    console.error("Fetch Tasks API error:", error.response?.data || error.message);
    // Return a standard error format
    return { success: false, error: error.response?.data?.message || error.message || 'Failed to fetch tasks.' };
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await axiosInstance.post('/api/tasks', taskData);
    return response.data; // Expecting { success: boolean, data: Task, message?: string }
  } catch (error) {
    console.error("Create Task API error:", error.response?.data || error.message);
    throw error; // Re-throw for the form to catch
  }
};

export const updateTask = async (taskId, updates) => {
  try {
    const response = await axiosInstance.put(`/api/tasks/${taskId}`, updates);
    return response.data; // Expecting { success: boolean, data?: Task, message?: string }
  } catch (error) {
    console.error(`Update Task (${taskId}) API error:`, error.response?.data || error.message);
     return { success: false, message: error.response?.data?.message || error.message || 'Failed to update task.' };
  }
};

export const deleteTask = async (taskId) => {
  try {
    const response = await axiosInstance.delete(`/api/tasks/${taskId}`);
    return response.data; // Expecting { success: boolean, message?: string }
  } catch (error) {
    console.error(`Delete Task (${taskId}) API error:`, error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || error.message || 'Failed to delete task.' };
  }
};

// --- Subtask API Calls --- 

export const addSubtask = async (taskId, subtaskData) => {
  try {
    const response = await axiosInstance.post(`/api/tasks/${taskId}/subtasks`, subtaskData);
    return response.data; // Expecting { success: boolean, data: Subtask, message?: string }
  } catch (error) {
    console.error(`Add Subtask to (${taskId}) API error:`, error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || error.message || 'Failed to add subtask.' };
  }
};

export const updateSubtask = async (taskId, subtaskId, updates) => {
  // Use the parent task's endpoint for updating subtasks
  try {
    const response = await axiosInstance.put(`/api/tasks/${taskId}/subtasks/${subtaskId}`, updates);
    return response.data; // Expecting { success: boolean, data?: Subtask, message?: string }
  } catch (error) {
    console.error(`Update Subtask (${subtaskId}) API error:`, error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || error.message || 'Failed to update subtask.' };
  }
};

export const deleteSubtask = async (taskId, subtaskId) => {
  // Use the parent task's endpoint for deleting subtasks
  try {
    const response = await axiosInstance.delete(`/api/tasks/${taskId}/subtasks/${subtaskId}`);
    return response.data; // Expecting { success: boolean, message?: string }
  } catch (error) {
    console.error(`Delete Subtask (${subtaskId}) API error:`, error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || error.message || 'Failed to delete subtask.' };
  }
};
