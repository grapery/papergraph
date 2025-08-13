'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store';
import { 
  BarChart3, 
  Star, 
  TrendingUp, 
  Users, 
  Award,
  Filter,
  Download,
  Eye,
  Calendar
} from 'lucide-react';

interface Evaluation {
  id: string;
  paperId: string;
  title: string;
  overallScore: number;
  criteria: {
    methodology: number;
    originality: number;
    significance: number;
    clarity: number;
    reproducibility: number;
  };
  evalCount: number;
  createdAt: string;
  author: string;
}

export default function EvaluationPage() {
  const { user, isAuthenticated } = useAuth();
  const { sidebarOpen } = useAppStore();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchEvaluations = async () => {
      try {
        const response = await fetch('/api/evaluations', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setEvaluations(data.evaluations || []);
        }
      } catch (error) {
        console.error('Failed to fetch evaluations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, [isAuthenticated]);

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600 bg-green-50';
    if (score >= 4.0) return 'text-blue-600 bg-blue-50';
    if (score >= 3.5) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getScoreText = (score: number) => {
    if (score >= 4.5) return '优秀';
    if (score >= 4.0) return '良好';
    if (score >= 3.5) return '一般';
    return '需改进';
  };

  const filteredEvaluations = evaluations.filter(evaluation => {
    if (filter === 'my') return String(evaluation.author) === String(user?.id);
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">论文评价</h1>
            <p className="text-gray-600 mb-8">请先登录以查看论文评价</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">论文评价</h1>
          <p className="text-gray-600">基于多维度评价体系的学术论文质量评估</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <h3 className="font-medium text-gray-900">总评价数</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{evaluations.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-8 h-8 text-yellow-500" />
              <h3 className="font-medium text-gray-900">平均评分</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {evaluations.length > 0 
                ? (evaluations.reduce((sum, evaluation) => sum + evaluation.overallScore, 0) / evaluations.length).toFixed(1)
                : '0.0'
              }
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <h3 className="font-medium text-gray-900">优秀论文</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {evaluations.filter(evaluation => evaluation.overallScore >= 4.5).length}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-purple-600" />
              <h3 className="font-medium text-gray-900">评价人数</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {evaluations.reduce((sum, evaluation) => sum + evaluation.evalCount, 0)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">评价列表</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  >
                    <option value="all">全部评价</option>
                    <option value="my">我的评价</option>
                  </select>
                </div>
                <button className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900">
                  <Download className="w-4 h-4" />
                  导出
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : filteredEvaluations.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无评价记录</h3>
                <p className="text-gray-600">开始评价第一篇论文吧</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredEvaluations.map((evaluation) => (
                  <div key={evaluation.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-2">{evaluation.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(evaluation.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {evaluation.evalCount} 人评价
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(evaluation.overallScore)}`}>
                          {evaluation.overallScore.toFixed(1)} - {getScoreText(evaluation.overallScore)}
                        </div>
                        <button className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700">
                          <Eye className="w-4 h-4" />
                          查看详情
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {Object.entries(evaluation.criteria).map(([key, score]) => (
                        <div key={key} className="text-center">
                          <div className="text-sm text-gray-600 mb-1">
                            {key === 'methodology' ? '方法论' :
                             key === 'originality' ? '原创性' :
                             key === 'significance' ? '重要性' :
                             key === 'clarity' ? '清晰度' :
                             key === 'reproducibility' ? '可复现性' : key}
                          </div>
                          <div className="text-lg font-semibold text-gray-900">{score.toFixed(1)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}