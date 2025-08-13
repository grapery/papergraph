'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { createActivity, EVENT_TYPES, TARGET_TYPES } from '@/lib/api';
import { 
  FileText, 
  Upload, 
  BarChart3, 
  Star, 
  TrendingUp,
  Plus,
  Search,
  Filter
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const { trackPaperAnalysis, trackAnalysisCompletion } = useActivityTracker();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleStartAnalysis = async (paperData: any) => {
    if (!isAuthenticated || !user) {
      alert('请先登录');
      return;
    }

    setIsAnalyzing(true);
    try {
      // 记录开始分析事件
      await createActivity(
        EVENT_TYPES.ANALYSIS_CREATED,
        TARGET_TYPES.ANALYSIS,
        Date.now(), // 临时ID
        `开始分析论文《${paperData.title}》`,
        `使用AI工具开始分析论文《${paperData.title}》`,
        {
          paper_title: paperData.title,
          paper_authors: paperData.authors,
          analysis_status: 'started'
        }
      );

      // 模拟分析过程
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 记录分析完成事件
      await trackAnalysisCompletion(
        Date.now(), // 分析ID
        paperData.id, // 论文ID
        paperData.title,
        8.5 // 模拟分数
      );

      alert('分析完成！');
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('分析失败，请重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLikePaper = async (paperData: any) => {
    if (!isAuthenticated || !user) {
      alert('请先登录');
      return;
    }

    try {
      await createActivity(
        EVENT_TYPES.PAPER_LIKED,
        TARGET_TYPES.PAPER,
        paperData.id,
        `点赞了论文《${paperData.title}》`,
        `认为论文《${paperData.title}》很有价值`,
        {
          paper_title: paperData.title,
          interaction_type: 'like'
        }
      );
      
      alert('点赞成功！');
    } catch (error) {
      console.error('Like failed:', error);
      alert('点赞失败，请重试');
    }
  };

  const handleRecommendPaper = async (paperData: any) => {
    if (!isAuthenticated || !user) {
      alert('请先登录');
      return;
    }

    try {
      await createActivity(
        EVENT_TYPES.PAPER_RECOMMENDED,
        TARGET_TYPES.PAPER,
        paperData.id,
        `推荐了论文《${paperData.title}》`,
        `推荐阅读论文《${paperData.title}》，内容很有价值`,
        {
          paper_title: paperData.title,
          recommendation_reason: 'high_quality_content'
        }
      );
      
      alert('推荐成功！');
    } catch (error) {
      console.error('Recommendation failed:', error);
      alert('推荐失败，请重试');
    }
  };

  // 模拟论文数据
  const recentPapers = [
    {
      id: 1,
      title: '深度学习在图像识别中的应用研究',
      authors: ['张三', '李四'],
      abstract: '本研究提出了一种新的深度学习架构...',
      publishDate: '2024-01-15',
      category: 'cs-ai'
    },
    {
      id: 2,
      title: '自然语言处理的新方法与应用',
      authors: ['王五', '赵六'],
      abstract: '本文提出了一种创新的自然语言处理方法...',
      publishDate: '2024-01-10',
      category: 'cs-nlp'
    },
    {
      id: 3,
      title: '量子计算在密码学中的应用前景',
      authors: ['钱七', '孙八'],
      abstract: '探讨了量子计算技术对现代密码学的影响...',
      publishDate: '2024-01-05',
      category: 'quantum'
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">欢迎使用Papergraph</h1>
            <p className="text-gray-600 mb-8">请先登录以开始使用AI论文分析功能</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">分析工作台</h1>
          <p className="text-gray-600">使用AI工具分析论文，记录您的学术活动</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="w-8 h-8 text-blue-600" />
              <h3 className="font-medium text-gray-900">上传论文</h3>
            </div>
            <p className="text-sm text-gray-600">上传PDF文件开始AI分析</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-8 h-8 text-green-600" />
              <h3 className="font-medium text-gray-900">我的分析</h3>
            </div>
            <p className="text-sm text-gray-600">查看历史分析记录</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-8 h-8 text-yellow-600" />
              <h3 className="font-medium text-gray-900">评价论文</h3>
            </div>
            <p className="text-sm text-gray-600">对论文进行多维度评价</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <h3 className="font-medium text-gray-900">动态</h3>
            </div>
            <p className="text-sm text-gray-600">查看最新学术动态</p>
          </div>
        </div>

        {/* Recent Papers */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">最新论文</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="搜索论文..."
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  />
                </div>
                <button className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900">
                  <Filter className="w-4 h-4" />
                  筛选
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {recentPapers.map((paper) => (
                <div key={paper.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2">{paper.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        作者: {paper.authors.join(', ')}
                      </p>
                      <p className="text-sm text-gray-500 mb-3">
                        {paper.abstract}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>发布时间: {paper.publishDate}</span>
                        <span>分类: {paper.category}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleStartAnalysis(paper)}
                        disabled={isAnalyzing}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                      >
                        <BarChart3 className="w-4 h-4" />
                        {isAnalyzing ? '分析中...' : '分析'}
                      </button>
                      <button
                        onClick={() => handleLikePaper(paper)}
                        className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded-md text-sm hover:bg-red-200"
                      >
                        <Star className="w-4 h-4" />
                        点赞
                      </button>
                      <button
                        onClick={() => handleRecommendPaper(paper)}
                        className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-600 rounded-md text-sm hover:bg-green-200"
                      >
                        <Plus className="w-4 h-4" />
                        推荐
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Tracking Demo */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">活动记录演示</h2>
          <p className="text-blue-800 mb-4">
            当您执行以下操作时，系统会自动记录您的活动事件：
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">📊 分析论文</h3>
              <p className="text-sm text-gray-600">使用AI工具分析论文时，会记录分析开始和完成事件</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">❤️ 点赞论文</h3>
              <p className="text-sm text-gray-600">点赞论文时会记录您的喜好和推荐行为</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">📝 创建评价</h3>
              <p className="text-sm text-gray-600">对论文进行评价时会记录您的专业见解</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">💬 发表评论</h3>
              <p className="text-sm text-gray-600">参与讨论时会记录您的学术交流</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => window.location.href = `/profile/${user.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              查看我的活动记录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}