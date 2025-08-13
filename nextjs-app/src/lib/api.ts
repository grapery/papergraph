import axios from 'axios';
import { useAppStore } from '@/store';
import type { CreateActivityRequest, ActivityQuery, ActivityResponse, UserActivity } from '@/types';

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

// User Activity API
export const activityApi = {
  // Create activity
  create: async (data: CreateActivityRequest) => {
    const response = await api.post('/api/activities', data);
    return response.data;
  },

  // Get activities with filters
  getActivities: async (query?: ActivityQuery) => {
    const response = await api.get('/api/activities', { params: query });
    return response.data as ActivityResponse;
  },

  // Get user activities
  getUserActivities: async (userId: number, query?: ActivityQuery) => {
    const response = await api.get(`/api/users/${userId}/activities`, { params: query });
    return response.data as ActivityResponse;
  },

  // Get my activities
  getMyActivities: async (query?: ActivityQuery) => {
    const response = await api.get('/api/me/activities', { params: query });
    return response.data as ActivityResponse;
  },

  // Get activity by ID
  getActivityById: async (id: number) => {
    const response = await api.get(`/api/activities/${id}`);
    return response.data;
  },

  // Delete activity
  deleteActivity: async (id: number) => {
    const response = await api.delete(`/api/activities/${id}`);
    return response.data;
  },

  // Get user activity stats
  getUserStats: async (userId: number) => {
    const response = await api.get(`/api/users/${userId}/activities/stats`);
    return response.data;
  },

  // Get feed
  getFeed: async (query?: ActivityQuery) => {
    const response = await api.get('/api/feed', { params: query });
    return response.data as ActivityResponse;
  },
};

// Helper function to create activity events
export const createActivity = async (
  eventType: string,
  targetType: string,
  targetId: number,
  title?: string,
  content?: string,
  metadata?: Record<string, any>
) => {
  const user = JSON.parse(localStorage.getItem('mock_user') || '{}');
  if (!user.id) {
    throw new Error('User not authenticated');
  }

  return await activityApi.create({
    user_id: user.id,
    event_type: eventType,
    target_type: targetType,
    target_id: targetId,
    title,
    content,
    metadata,
    visibility: 'public',
  });
};

export default api;