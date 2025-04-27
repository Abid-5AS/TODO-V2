// src/features/auth/services/authService.js
// Contains functions for authentication-related API calls.

import axiosInstance from '../../../api/axiosInstance';

export const loginUser = async (credentials) => {
  try {
    const response = await axiosInstance.post('/api/auth/login', credentials);
    if (response.data.success) {
      return response.data; // Contains user and token
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  } catch (error) {
    console.error("Login API error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'An error occurred during login.');
  }
};

export const signupUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/api/auth/signup', userData);
     if (response.data.success) {
      return response.data; // Contains user and token
    } else {
      throw new Error(response.data.message || 'Signup failed');
    }
  } catch (error) {
    console.error("Signup API error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'An error occurred during signup.');
  }
};

export const fetchUserProfile = async () => {
  try {
    const response = await axiosInstance.get('/api/auth/me');
    if (response.data.success) {
      return response.data.user;
    } else {
      // Don't throw error, return null to indicate profile fetch failed but not necessarily an API error
      console.warn('Failed to fetch user profile:', response.data.message);
      return null; 
    }
  } catch (error) {
    // Specifically handle 401 Unauthorized, otherwise rethrow
    if (error.response && error.response.status === 401) {
      console.log('User not authenticated (401).');
      return null;
    } else {
      console.error("Fetch Profile API error:", error.response?.data || error.message);
      // Rethrow other errors so the context can handle them (e.g., network error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch user profile.');
    }
  }
};
