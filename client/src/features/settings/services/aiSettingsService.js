// src/features/settings/services/aiSettingsService.js
// Contains functions for AI settings related API calls.

import axiosInstance from '../../../api/axiosInstance';

export const getAIProviderStatus = async () => {
  try {
    const response = await axiosInstance.get('/api/ai/provider-status');
    // Expecting { success: boolean, useLocalAI: boolean, status: 'connected' | 'disconnected' | 'unknown', provider: string }
    return response.data;
  } catch (error) {
    console.error("Get AI Provider Status API error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || error.message || 'Failed to get AI provider status.' };
  }
};

export const toggleAIProvider = async (useLocalAI) => {
  try {
    const response = await axiosInstance.post('/api/ai/toggle-provider', { useLocal: useLocalAI });
     // Expecting { success: boolean, useLocalAI: boolean, status?: 'connected' | 'disconnected' | 'unknown', message?: string }
    return response.data;
  } catch (error) {
    console.error("Toggle AI Provider API error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || error.message || 'Failed to toggle AI provider.' };
  }
};
