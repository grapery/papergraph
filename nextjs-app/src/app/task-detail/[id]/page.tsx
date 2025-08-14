'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ExportButton, ExportOptions } from '@/components/ExportButton';
import { 
  FileText, 
  User, 
  Calendar, 
  ExternalLink,
  Heart,
  MessageCircle,
  Share2,
  Star,
  ArrowLeft,
  Download,
  BarChart3,
  TrendingUp,
  Target,
  Lightbulb,
  Award,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AnalysisResult {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  paper?: {
    id: number;
    title: string;
    authors: string[];
    abstract: string;
    category: string;
    publishDate: string;
    doi?: string;
    journal?: string;
    volume?: string;
    number?: string;
    pages?: string;
  };
  result?: {
    summary: string;
    keyPoints: string[];
    methodology: string;
    innovations: string[];
    limitations: string[];
    futureWork: string[];
    evaluation: {
      overall: number;
      innovation: number;
      methodology: number;
      impact: number;
      clarity: number;
      reproducibility: number;
      significance: number;
    };
    charts?: Array<{
      id: string;
      title: string;
      type: string;
      data: any;
    }>;
  };
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`/api/task_detail/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAnalysis(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch analysis:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id && isAuthenticated) {
      fetchAnalysis();
    }
  }, [params.id, isAuthenticated]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('请先登录');
      return;
    }

    try {
      const response = await fetch('/api/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ task_id: analysis?.id })
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(!isLiked);
        if (analysis) {
          setAnalysis({
            ...analysis,
            stats: {
              ...analysis.stats,
              likes: data.data.likeCount
            }
          });
        }
      }
    } catch (error) {
      console.error('Like failed:', error);
    }
  };

  const handleShare = async () => {
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ paper_id: analysis?.paper?.id })
      });

      if (response.ok) {
        const data = await response.json();
        await navigator.clipboard.writeText(data.data.shareUrl);
        alert('链接已复制到剪贴板！');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">分析记录不存在</h1>
          <Link href="/my-analyses" className="text-blue-600 hover:text-blue-700">
            返回我的分析
          </Link>
        </div>
      </div>
    );
  }

  const chartIds = analysis.result?.charts?.map(chart => chart.id) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                {getStatusIcon(analysis.status)}
                <span className="text-sm font-medium text-gray-600">
                  {getStatusText(analysis.status)}
                </span>
                <span className="text-sm text-gray-500">
                  创建于 {new Date(analysis.createdAt).toLocaleString('zh-CN')}
                </span>
                {analysis.completedAt && (
                  <span className="text-sm text-gray-500">
                    完成于 {new Date(analysis.completedAt).toLocaleString('zh-CN')}
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {analysis.title}
              </h1>
              
              {analysis.paper && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h2 className="text-lg font-semibold text-blue-900 mb-2">原始论文</h2>
                  <h3 className="font-medium text-blue-800 mb-1">{analysis.paper.title}</h3>
                  <p className="text-sm text-blue-700 mb-2">
                    {analysis.paper.authors.join(', ')}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-blue-600">
                    <span>{new Date(analysis.paper.publishDate).toLocaleDateString('zh-CN')}</span>
                    {analysis.paper.journal && (
                      <span>{analysis.paper.journal}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Export Options */}
            {analysis.status === 'completed' && (
              <ExportOptions 
                targetId="analysis-report"
                chartIds={chartIds}
                className="ml-4"
              />
            )}
          </div>
        </div>

        {/* Analysis Report */}
        {analysis.status === 'completed' && analysis.result && (
          <div id="analysis-report" className="space-y-6">
            {/* Summary Section */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">分析总结</h2>
              </div>
              
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {analysis.result.summary}
                </p>
              </div>
            </div>

            {/* Key Points */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">关键要点</h2>
              </div>
              
              <div className="grid gap-4">
                {analysis.result.keyPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-gray-700">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Methodology */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">研究方法</h2>
              </div>
              
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {analysis.result.methodology}
                </p>
              </div>
            </div>

            {/* Innovations */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center gap-2 mb-6">
                <Lightbulb className="w-6 h-6 text-yellow-600" />
                <h2 className="text-2xl font-bold text-gray-900">创新点</h2>
              </div>
              
              <div className="grid gap-4">
                {analysis.result.innovations.map((innovation, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Award className="w-4 h-4 text-yellow-600" />
                    </div>
                    <p className="text-gray-700">{innovation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Evaluation */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-bold text-gray-900">综合评价</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-red-600">
                      {analysis.result.evaluation.overall.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">综合评分</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 mb-1">
                    {analysis.result.evaluation.innovation.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">创新性</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 mb-1">
                    {analysis.result.evaluation.methodology.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">方法论</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 mb-1">
                    {analysis.result.evaluation.impact.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">影响力</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 mb-1">
                    {analysis.result.evaluation.clarity.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">清晰度</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 mb-1">
                    {analysis.result.evaluation.reproducibility.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">可复现性</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 mb-1">
                    {analysis.result.evaluation.significance.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">显著性</div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            {analysis.result.charts && analysis.result.charts.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-2xl font-bold text-gray-900">数据图表</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {analysis.result.charts.map((chart) => (
                    <div 
                      key={chart.id} 
                      id={chart.id}
                      data-chart-title={chart.title}
                      className="bg-gray-50 rounded-lg p-6"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {chart.title}
                      </h3>
                      <div className="h-64 flex items-center justify-center text-gray-500">
                        图表占位符 - {chart.type}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Limitations */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center gap-2 mb-6">
                <AlertCircle className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">局限性</h2>
              </div>
              
              <div className="grid gap-4">
                {analysis.result.limitations.map((limitation, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                    </div>
                    <p className="text-gray-700">{limitation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Future Work */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-6 h-6 text-teal-600" />
                <h2 className="text-2xl font-bold text-gray-900">未来工作</h2>
              </div>
              
              <div className="grid gap-4">
                {analysis.result.futureWork.map((work, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <TrendingUp className="w-4 h-4 text-teal-600" />
                    </div>
                    <p className="text-gray-700">{work}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                  isLiked
                    ? 'bg-red-50 text-red-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
                <span>{isLiked ? '已点赞' : '点赞'}</span>
                <span>({analysis.stats.likes})</span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>分享</span>
              </button>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>评论</span>
                <span>({analysis.stats.comments})</span>
              </button>
            </div>
            
            {analysis.paper?.doi && (
              <a
                href={`https://doi.org/${analysis.paper.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>查看原文</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}