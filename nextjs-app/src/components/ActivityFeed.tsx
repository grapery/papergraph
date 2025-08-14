'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { activityApi } from '@/lib/api';
import type { UserActivity, ActivityQuery } from '@/types';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Star, 
  BookOpen, 
  BarChart3, 
  Award,
  TrendingUp,
  User,
  Clock,
  Filter,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  userId?: number;
  showFilters?: boolean;
  className?: string;
}

const EVENT_TYPE_LABELS = {
  'paper_analyzed': { label: '分析了论文', icon: BarChart3, color: 'blue' },
  'paper_liked': { label: '点赞了论文', icon: Heart, color: 'red' },
  'paper_recommended': { label: '推荐了论文', icon: Star, color: 'yellow' },
  'paper_shared': { label: '分享了论文', icon: Share2, color: 'green' },
  'analysis_created': { label: '创建了分析', icon: BarChart3, color: 'blue' },
  'analysis_updated': { label: '更新了分析', icon: BarChart3, color: 'purple' },
  'analysis_completed': { label: '完成了分析', icon: BarChart3, color: 'green' },
  'evaluation_created': { label: '创建了评价', icon: Star, color: 'yellow' },
  'evaluation_updated': { label: '更新了评价', icon: Star, color: 'purple' },
  'evaluation_liked': { label: '点赞了评价', icon: Heart, color: 'red' },
  'comment_created': { label: '发表了评论', icon: MessageSquare, color: 'blue' },
  'comment_liked': { label: '点赞了评论', icon: Heart, color: 'red' },
  'comment_replied': { label: '回复了评论', icon: MessageSquare, color: 'green' },
  'badge_earned': { label: '获得了徽章', icon: Award, color: 'yellow' },
  'level_up': { label: '升级了', icon: TrendingUp, color: 'green' },
  'follow_user': { label: '关注了用户', icon: User, color: 'blue' },
  'unfollow_user': { label: '取消关注用户', icon: User, color: 'gray' },
};

const TARGET_TYPE_LABELS = {
  'paper': '论文',
  'analysis': '分析',
  'evaluation': '评价',
  'comment': '评论',
  'user': '用户',
  'badge': '徽章',
};

export default function ActivityFeed({ userId, showFilters = true, className }: ActivityFeedProps) {
  const { user, isAuthenticated } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ActivityQuery>({
    page: 1,
    page_size: 20,
  });
  const [hasMore, setHasMore] = useState(true);

  const loadActivities = async (isLoadMore = false) => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (userId) {
        response = await activityApi.getUserActivities(userId, filters);
      } else if (isAuthenticated && !userId) {
        response = await activityApi.getMyActivities(filters);
      } else {
        response = await activityApi.getFeed(filters);
      }

      if (isLoadMore) {
        setActivities(prev => [...prev, ...response.activities]);
      } else {
        setActivities(response.activities);
      }

      setHasMore(response.pagination.page < response.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [userId, isAuthenticated, filters.page, filters.event_type, filters.visibility]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }));
    }
  };

  const handleRefresh = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    loadActivities();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return '刚刚';
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}小时前`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}天前`;
    
    return date.toLocaleDateString('zh-CN');
  };

  const getEventInfo = (eventType: string) => {
    return EVENT_TYPE_LABELS[eventType as keyof typeof EVENT_TYPE_LABELS] || 
           { label: eventType, icon: Clock, color: 'gray' };
  };

  const ActivityCard = ({ activity }: { activity: UserActivity }) => {
    const eventInfo = getEventInfo(activity.event_type);
    const Icon = eventInfo.icon;
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-600',
      red: 'bg-red-100 text-red-600',
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      purple: 'bg-purple-100 text-purple-600',
      gray: 'bg-gray-100 text-gray-600',
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <div className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
            colorClasses[eventInfo.color as keyof typeof colorClasses]
          )}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <img
                src={activity.user.avatar || 'https://api.dicebear.com/7.x/miniavs/svg?seed=' + activity.user.id}
                alt={activity.user.name}
                className="w-6 h-6 rounded-full"
              />
              <span className="font-medium text-gray-900">{activity.user.name}</span>
              <span className="text-gray-500">•</span>
              <span className="text-sm text-gray-500">{formatTimeAgo(activity.created_at)}</span>
            </div>
            
            <div className="mb-2">
              <span className="text-gray-700">{eventInfo.label}</span>
              {activity.title && (
                <span className="text-gray-900 font-medium"> {activity.title}</span>
              )}
              {activity.target_type && (
                <span className="text-gray-500 text-sm">
                  ({TARGET_TYPE_LABELS[activity.target_type as keyof typeof TARGET_TYPE_LABELS] || activity.target_type})
                </span>
              )}
            </div>
            
            {activity.content && (
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {activity.content}
              </p>
            )}
            
            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
              <div className="bg-gray-50 rounded-md p-2 text-xs text-gray-600">
                {Object.entries(activity.metadata).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium">{key}:</span> {String(value)}
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {activity.like_count}
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {activity.comment_count}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {activity.visibility === 'public' ? '公开' : activity.visibility === 'private' ? '私密' : '好友可见'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {userId ? '用户动态' : isAuthenticated ? '我的动态' : '最新动态'}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
          {showFilters && (
            <select
              value={filters.event_type || ''}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                event_type: e.target.value || undefined,
                page: 1 
              }))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="">全部类型</option>
              {Object.entries(EVENT_TYPE_LABELS).map(([key, info]) => (
                <option key={key} value={key}>{info.label}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && activities.length === 0 && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activities */}
      {activities.length > 0 && (
        <div className="space-y-4">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && activities.length === 0 && !error && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {userId ? '该用户还没有任何动态' : '暂无动态'}
          </h3>
          <p className="text-gray-600 text-sm">
            {userId ? '当用户有活动时会在这里显示' : '开始使用系统后，您的活动会在这里显示'}
          </p>
        </div>
      )}

      {/* Load More */}
      {hasMore && !loading && (
        <div className="text-center">
          <button
            onClick={handleLoadMore}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            加载更多
          </button>
        </div>
      )}

      {loading && activities.length > 0 && (
        <div className="text-center py-4">
          <RefreshCw className="w-6 h-6 text-gray-400 mx-auto animate-spin" />
        </div>
      )}
    </div>
  );
}