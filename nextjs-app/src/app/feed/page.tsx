'use client';

import { useState } from 'react';
import { usePapers } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye,
  TrendingUp,
  Clock,
  Star,
  Filter
} from 'lucide-react';

export default function FeedPage() {
  const { papers, loading } = usePapers();
  const { isAuthenticated } = useAuth();
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'trending'>('latest');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const sortedPapers = [...papers].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.stats.likes - a.stats.likes;
      case 'trending':
        return b.stats.views - a.stats.views;
      default:
        return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
    }
  });

  const filteredPapers = sortedPapers.filter(paper => 
    !selectedCategory || paper.category === selectedCategory
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">探索论文</h1>
          <p className="text-gray-600">发现最新的学术研究成果和热门论文</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">排序方式:</span>
              <div className="flex gap-2">
                {[
                  { id: 'latest', label: '最新发布', icon: Clock },
                  { id: 'popular', label: '最受欢迎', icon: Heart },
                  { id: 'trending', label: '热门趋势', icon: TrendingUp },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSortBy(option.id as any)}
                    className={cn(
                      'flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                      sortBy === option.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    <option.icon className="w-4 h-4" />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Papers Feed */}
        <div className="space-y-6">
          {filteredPapers.map((paper) => (
            <FeedCard key={paper.id} paper={paper} />
          ))}
        </div>

        {filteredPapers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">暂无论文</div>
            <div className="text-gray-500">请尝试其他筛选条件</div>
          </div>
        )}
      </div>
    </div>
  );
}

function FeedCard({ paper }: { paper: any }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(paper.stats.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
              {getFieldLabel(paper.category)}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(paper.publishDate).toLocaleDateString('zh-CN')}
            </span>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
            {paper.title}
          </h3>
          
          <p className="text-sm text-gray-600 mb-3">
            {paper.authors.join(', ')}
          </p>
          
          <p className="text-gray-700 mb-4 line-clamp-3">
            {paper.abstract}
          </p>
          
          {/* Evaluation Score */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {paper.evaluation.overall.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">综合评分</div>
              </div>
            </div>
            
            <div className="flex-1 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">
                  {paper.evaluation.innovation.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">创新性</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">
                  {paper.evaluation.methodology.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">方法论</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">
                  {paper.evaluation.impact.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">影响力</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{paper.stats.views}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{paper.stats.comments}</span>
          </div>
          <div className="flex items-center gap-1">
            <Share2 className="w-4 h-4" />
            <span>{paper.stats.shares}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            <span>{paper.stats.citations}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleLike}
            className={cn(
              'flex items-center gap-1 px-3 py-1 rounded-lg transition-colors',
              isLiked
                ? 'bg-red-50 text-red-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
            <span>{likeCount}</span>
          </button>
          
          <button className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
            <Share2 className="w-4 h-4" />
            <span>分享</span>
          </button>
          
          <button className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            查看详情
          </button>
        </div>
      </div>
    </div>
  );
}

function getFieldLabel(field: string): string {
  const fields: Record<string, string> = {
    'cs-ai': '人工智能',
    'cs-system': '计算机系统',
    'bio-med': '生物医学',
    'physics': '物理学',
    'chemistry': '化学',
    'math': '数学',
    'economics': '经济学',
    'env-science': '环境科学',
    'other': '其他'
  };
  return fields[field] || '未设置';
}