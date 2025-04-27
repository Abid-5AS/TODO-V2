// src/api/axiosInstance.js
// Configures and exports the Axios instance used for API calls.

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001', // Use environment variable
});

// Add a request interceptor to include the token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor for global error handling (e.g., 401)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access, e.g., redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Use window.location to redirect outside of React Router context if needed
      if (!window.location.pathname.startsWith('/login')) {
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
