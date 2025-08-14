'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCategories, usePapers } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  Calendar, 
  Trophy, 
  Star, 
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Filter,
  Grid,
  List
} from 'lucide-react';

const rankingFilters = [
  { id: 'trending', name: '热门趋势', icon: TrendingUp },
  { id: 'weekly', name: '本周最佳', icon: Calendar },
  { id: 'alltime', name: '历史经典', icon: Trophy },
];

const viewModes = [
  { id: 'grid', name: '网格视图', icon: Grid },
  { id: 'list', name: '列表视图', icon: List },
];

export default function Homepage() {
  const router = useRouter();
  const { categories, loading: categoriesLoading } = useCategories();
  const { papers, loading: papersLoading } = usePapers();
  const { isAuthenticated, login } = useAuth();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState('trending');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Handle OAuth callback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const userParam = urlParams.get('user');
      
      if (token && userParam) {
        try {
          const userData = JSON.parse(decodeURIComponent(userParam));
          login(userData, token);
          
          // Clean up URL
          window.history.replaceState({}, '', '/home');
        } catch (error) {
          console.error('Failed to parse user data:', error);
          router.push('/auth?error=invalid_data');
        }
      }
    }
  }, [login, router]);

  const filteredPapers = papers.filter(paper => 
    !selectedCategory || paper.category === selectedCategory
  );

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? '' : categoryId);
  };

  if (categoriesLoading || papersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              发现优质学术研究
            </h1>
            <p className="text-xl mb-8 opacity-90">
              基于多维度评价体系的学术论文排名平台
            </p>
            <div className="flex justify-center gap-4">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                开始探索
              </button>
              <button className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors">
                了解更多
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">学科分类</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={cn(
                'flex flex-col items-center p-4 rounded-lg border-2 transition-all',
                selectedCategory === category.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <div className="text-2xl mb-2">{category.icon}</div>
              <div className="text-sm font-medium text-gray-900 text-center">
                {category.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Papers Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedCategory 
              ? `${categories.find(c => c.id === selectedCategory)?.name} 论文`
              : '热门论文'
            }
          </h2>
          
          <div className="flex items-center gap-4">
            {/* Filter Options */}
            <div className="flex items-center gap-2">
              {rankingFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    selectedFilter === filter.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  <filter.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{filter.name}</span>
                </button>
              ))}
            </div>
            
            {/* View Mode */}
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1">
              {viewModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  className={cn(
                    'p-2 rounded transition-colors',
                    viewMode === mode.id
                      ? 'bg-white shadow-sm'
                      : 'hover:bg-gray-100'
                  )}
                >
                  <mode.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-4 h-4" />
              筛选
            </button>
          </div>
        </div>

        {/* Papers Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPapers.map((paper) => (
              <PaperCard key={paper.id} paper={paper} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPapers.map((paper) => (
              <PaperListItem key={paper.id} paper={paper} />
            ))}
          </div>
        )}

        {filteredPapers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">暂无论文</div>
            <div className="text-gray-500">请选择其他分类或稍后再试</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Paper Card Component
function PaperCard({ paper }: { paper: any }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {paper.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {paper.authors.join(', ')}
          </p>
          <p className="text-sm text-gray-500 line-clamp-3">
            {paper.abstract}
          </p>
        </div>
        <div className="ml-4 text-right">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {paper.evaluation.overall.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">综合评分</div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{paper.stats.views}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{paper.stats.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{paper.stats.comments}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Heart className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Share2 className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Paper List Item Component
function PaperListItem({ paper }: { paper: any }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
              #{paper.rank}
            </span>
            <h3 className="text-lg font-semibold text-gray-900">
              {paper.title}
            </h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">
            {paper.authors.join(', ')}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {paper.abstract}
          </p>
          
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{paper.stats.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{paper.stats.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{paper.stats.comments}</span>
            </div>
            <div className="flex items-center gap-1">
              <Share2 className="w-4 h-4" />
              <span>{paper.stats.shares}</span>
            </div>
          </div>
        </div>
        
        <div className="ml-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {paper.evaluation.overall.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">综合评分</div>
          <div className="mt-2">
            <Star className="w-4 h-4 text-yellow-400 inline" />
            <span className="text-sm text-gray-600 ml-1">
              {paper.stats.citations} 引用
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}