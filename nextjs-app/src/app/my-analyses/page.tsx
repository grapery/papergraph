'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store';
import { FileText, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import Link from 'next/link';

interface Analysis {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  paperId?: string;
  result?: any;
}

export default function MyAnalysesPage() {
  const { user, isAuthenticated } = useAuth();
  const { sidebarOpen } = useAppStore();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchAnalyses = async () => {
      try {
        const response = await fetch('/api/tasks', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAnalyses(data.tasks || []);
        }
      } catch (error) {
        console.error('Failed to fetch analyses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, [isAuthenticated]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'processing':
        return '处理中';
      case 'failed':
        return '失败';
      default:
        return '等待中';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">我的分析</h1>
            <p className="text-gray-600 mb-8">请先登录以查看您的分析记录</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">我的分析</h1>
            <p className="text-gray-600 mt-2">查看和管理您的论文分析记录</p>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建分析
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : analyses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无分析记录</h3>
            <p className="text-gray-600 mb-6">开始您的第一篇论文分析吧</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              新建分析
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyses.map((analysis) => (
              <div key={analysis.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(analysis.status)}
                      <span className="text-sm font-medium text-gray-600">
                        {getStatusText(analysis.status)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {analysis.title || '未命名分析'}
                  </h3>
                  
                  <div className="mt-4">
                    <Link
                      href={`/task-detail/${analysis.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      查看详情 →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}