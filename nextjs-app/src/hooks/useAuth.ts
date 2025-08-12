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
      const mockUser = localStorage.getItem('mock_user');
      
      if (token && mockUser) {
        const userData = JSON.parse(mockUser);
        setUser(userData);
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
      
      // Mock data for now
      const mockUser: User = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        institution: 'Test University',
        position: 'phd',
        field: 'cs-ai',
        bio: 'This is a test user bio.',
        interests: ['Machine Learning', 'AI', 'Computer Vision'],
        created_at: new Date().toISOString(),
        stats: {
          analyses: 15,
          followers: 42,
          following: 28,
          likes: 156,
          citations: 89,
          badges: 8,
        }
      };
      
      const mockBadges: Badge[] = [
        {
          id: 1,
          name: '首次分析',
          description: '完成第一次论文分析',
          type: 'first_analysis',
          rarity: 'common',
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: '分析达人',
          description: '完成10次论文分析',
          type: 'analysis_master',
          rarity: 'rare',
          created_at: new Date().toISOString(),
        },
      ];
      
      const mockActivities: Activity[] = [
        {
          id: 1,
          type: 'analysis',
          content: '分析了论文《深度学习在图像识别中的应用》',
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 2,
          type: 'like',
          content: '点赞了论文《自然语言处理的新方法》',
          created_at: new Date(Date.now() - 7200000).toISOString(),
        },
      ];
      
      setUser(mockUser);
      setStats(mockUser.stats || null);
      setBadges(mockBadges);
      setActivities(mockActivities);
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