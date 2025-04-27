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
    const response = await axiosInstance.post('/api/ai/suggest-description', { title: taskTitle });
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
