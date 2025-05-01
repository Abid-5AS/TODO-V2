import axios from 'axios';

// Get the base URL from environment variables, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Or however you store your token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor for handling global errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    return response; // Pass through successful responses
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors (e.g., token expired)
      console.error('Unauthorized access - potentially expired token.');
      // Optionally clear token and redirect to login
      // localStorage.removeItem('token');
      // window.location.href = '/login'; // Force redirect
    }
    return Promise.reject(error); // Pass through other errors
  }
);

export default api; 