// src/features/tasks/services/aiService.js
// Contains functions for AI-related task operations.

import axiosInstance from '../../../api/axiosInstance';

export const getAISubtaskSuggestions = async (taskTitle) => {
  try {
    const response = await axiosInstance.post('/api/ai/suggest-subtasks', { title: taskTitle });
    // Assuming the backend returns { success: true, suggestion: '...' }
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to get AI subtask suggestions');
    }
  } catch (error) {
    console.error("AI Subtask Suggestion API error:", error.response?.data || error.message);
    // Throw a more specific error or return a failure object
    throw new Error(error.response?.data?.message || error.message || 'Could not get AI suggestions.');
  }
};

export const getAIDescriptionSuggestion = async (taskTitle) => {
  try {
    const response = await axiosInstance.post('/api/ai/expand-description', { title: taskTitle });
    // Assuming the backend returns { success: true, description: '...' }
     if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to get AI description suggestion');
    }
  } catch (error) {
     console.error("AI Description Suggestion API error:", error.response?.data || error.message);
    // Throw a more specific error or return a failure object
    throw new Error(error.response?.data?.message || error.message || 'Could not get AI description.');
  }
};

// Suggest tasks based on an uploaded image
export const suggestTaskFromImage = async (imageFile, prompt = '') => {
  if (!imageFile) {
    throw new Error('Image file is required.');
  }

  const formData = new FormData();
  formData.append('image', imageFile); // Key 'image' must match multer config on backend
  if (prompt) {
    formData.append('prompt', prompt); // Optional prompt/context
  }

  try {
    const response = await axiosInstance.post('/api/ai/suggest-task-from-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // Assuming backend returns { success: true, suggestions: '...', provider: '...' }
    if (response.data.success) {
      return response.data; // Contains { suggestions, provider }
    } else {
      throw new Error(response.data.message || 'Failed to get AI task suggestions from image');
    }
  } catch (error) {
    console.error('AI Image Task Suggestion API error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Could not get AI suggestions from image.');
  }
};
