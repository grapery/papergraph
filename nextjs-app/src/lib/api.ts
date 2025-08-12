import axios from 'axios';
import { useAppStore } from '@/store';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const store = useAppStore.getState();
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      store.logout();
      window.location.href = '/auth';
    }
    
    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message;
    store.setError(errorMessage);
    
    return Promise.reject(error);
  }
);

export default api;