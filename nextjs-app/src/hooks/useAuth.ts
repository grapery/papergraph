import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import api from '@/lib/api';
import type { User, UserStats, Badge, Activity } from '@/types';

export const useAuth = () => {
  const { user, isAuthenticated, setUser, setLoading, setError, login, logout } = useAppStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsCheckingAuth(true);
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        // Verify token with backend and get user info
        const response = await fetch('/api/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.data);
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('auth_token');
          logout();
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      logout();
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLogin = (userData: User, token: string) => {
    login(userData, token);
  };

  return {
    user,
    isAuthenticated,
    isCheckingAuth,
    login: handleLogin,
    logout,
  };
};

export const useUser = (userId: number) => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load user stats from API
      const [statsResponse, badgesResponse, activitiesResponse] = await Promise.all([
        fetch(`/api/user/${userId}/stats`),
        fetch(`/api/user/${userId}/badges`),
        fetch(`/users/${userId}/activities`),
      ]);
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }
      
      if (badgesResponse.ok) {
        const badgesData = await badgesResponse.json();
        setBadges(badgesData.data || []);
      }
      
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setActivities(activitiesData.data || []);
      }
      
      // For now, create a basic user object since we don't have a dedicated user profile endpoint
      const basicUser: User = {
        id: userId,
        name: 'User ' + userId,
        email: '',
        institution: '',
        position: '',
        field: '',
        bio: '',
        interests: [],
        created_at: new Date().toISOString(),
        stats: stats || {
          analyses: 0,
          followers: 0,
          following: 0,
          likes: 0,
          citations: 0,
          badges: 0,
        },
      };
      
      setUser(basicUser);
    } catch (error) {
      setError('Failed to load user data');
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    stats,
    badges,
    activities,
    loading,
    error,
    refetch: loadUserData,
  };
};