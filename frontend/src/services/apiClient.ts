import axios from 'axios';
import authService from './authService';
import { useAuthStore } from '../store/authStore';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  timeout: 30000,
});

// Request interceptor to add auth token and handle Content-Type
apiClient.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    
    if (token && token.trim() !== '') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Only set Content-Type to application/json if it's not FormData
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - clear auth state
    if (error.response?.status === 401) {
      useAuthStore.setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      // Don't redirect here - let React Router handle navigation
    }
    
    // Handle 403 Forbidden - show appropriate message
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
      // Don't redirect for 403, let the component handle it
    }
    
    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 