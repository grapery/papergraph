'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  FileText, 
  User, 
  Calendar, 
  ExternalLink,
  Heart,
  MessageCircle,
  Share2,
  Star,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface Paper {
  id: number;
  title: string;
  authors: string[];
  abstract: string;
  category: string;
  subcategory: string;
  publishDate: string;
  doi?: string;
  journal?: string;
  volume?: string;
  number?: string;
  pages?: string;
  evaluation: {
    innovation: number;
    methodology: number;
    impact: number;
    clarity: number;
    reproducibility: number;
    significance: number;
    overall: number;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    citations: number;
  };
  tags: string[];
  references: number;
  createdAt: string;
  updatedAt: string;
}

export default function PaperDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const response = await fetch(`/api/papers/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setPaper(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch paper:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPaper();
    }
  }, [params.id]);

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
        body: JSON.stringify({ task_id: paper?.id })
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(!isLiked);
        if (paper) {
          setPaper({
            ...paper,
            stats: {
              ...paper.stats,
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
        body: JSON.stringify({ paper_id: paper?.id })
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">论文不存在</h1>
          <Link href="/feed" className="text-blue-600 hover:text-blue-700">
            返回论文列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
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
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {paper.title}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{paper.authors.join(', ')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(paper.publishDate).toLocaleDateString('zh-CN')}</span>
                </div>
                {paper.journal && (
                  <div className="text-blue-600">
                    {paper.journal} {paper.volume && `Vol. ${paper.volume}`} {paper.number && `No. ${paper.number}`} {paper.pages && `pp. ${paper.pages}`}
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {paper.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">摘要</h2>
            <p className="text-gray-700 leading-relaxed mb-8">
              {paper.abstract}
            </p>
          </div>

          {/* Evaluation */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">评价</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {paper.evaluation.overall.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">综合评分</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {paper.evaluation.innovation.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">创新性</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {paper.evaluation.methodology.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">方法论</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {paper.evaluation.impact.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">影响力</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {paper.evaluation.clarity.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">清晰度</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {paper.evaluation.reproducibility.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">可复现性</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">统计</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {paper.stats.views}
                </div>
                <div className="text-sm text-gray-500">浏览量</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {paper.stats.likes}
                </div>
                <div className="text-sm text-gray-500">点赞数</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {paper.stats.comments}
                </div>
                <div className="text-sm text-gray-500">评论数</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {paper.stats.shares}
                </div>
                <div className="text-sm text-gray-500">分享数</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {paper.stats.citations}
                </div>
                <div className="text-sm text-gray-500">引用数</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isLiked
                    ? 'bg-red-50 text-red-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{isLiked ? '已点赞' : '点赞'}</span>
                <span>({paper.stats.likes})</span>
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
                <span>({paper.stats.comments})</span>
              </button>
            </div>
            
            {paper.doi && (
              <a
                href={`https://doi.org/${paper.doi}`}
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