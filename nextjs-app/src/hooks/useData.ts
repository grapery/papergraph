import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import type { Paper, Analysis, Category } from '@/types';

export const useCategories = () => {
  const { categories, setCategories, setLoading, setError } = useAppStore();
  const [loading, setLoadingState] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingState(true);
      setError(null);
      
      // Fetch categories from API
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      } else {
        // Fallback to mock data if API fails
        const mockCategories: Category[] = [
          {
            id: 'cs-ai',
            name: '人工智能',
            description: '机器学习、深度学习、自然语言处理等',
            icon: '🤖',
            color: '#3B82F6',
          },
          {
            id: 'cs-system',
            name: '计算机系统',
            description: '操作系统、分布式系统、计算机网络等',
            icon: '💻',
            color: '#10B981',
          },
          {
            id: 'bio-med',
            name: '生物医学',
            description: '生物信息学、医学影像、药物研发等',
            icon: '🧬',
            color: '#F59E0B',
          },
          {
            id: 'physics',
            name: '物理学',
            description: '量子物理、粒子物理、凝聚态物理等',
            icon: '⚛️',
            color: '#EF4444',
          },
          {
            id: 'chemistry',
            name: '化学',
            description: '有机化学、无机化学、物理化学等',
            icon: '🧪',
            color: '#8B5CF6',
          },
          {
            id: 'math',
            name: '数学',
            description: '纯数学、应用数学、统计学等',
            icon: '📐',
            color: '#06B6D4',
          },
          {
            id: 'economics',
            name: '经济学',
            description: '宏观经济、微观经济、金融学等',
            icon: '💰',
            color: '#F97316',
          },
          {
            id: 'env-science',
            name: '环境科学',
            description: '环境工程、生态学、气候变化等',
            icon: '🌍',
            color: '#84CC16',
          },
        ];
        
        setCategories(mockCategories);
      }
    } catch (error) {
      setError('Failed to load categories');
      console.error('Error loading categories:', error);
    } finally {
      setLoadingState(false);
    }
  };

  return {
    categories,
    loading,
    refetch: loadCategories,
  };
};

export const usePapers = (categoryId?: string) => {
  const { papers, setPapers, setLoading, setError } = useAppStore();
  const [loading, setLoadingState] = useState(false);

  useEffect(() => {
    loadPapers();
  }, [categoryId]);

  const loadPapers = async () => {
    try {
      setLoadingState(true);
      setError(null);
      
      // Fetch papers from API
      const response = await fetch('/api/papers');
      if (response.ok) {
        const data = await response.json();
        setPapers(data.data || []);
      } else {
        // Fallback to mock data if API fails
        const mockPapers: Paper[] = [
          {
            id: 1,
            title: '深度学习在图像识别中的应用研究',
            authors: ['张三', '李四', '王五'],
            abstract: '本研究提出了一种新的深度学习架构，用于提高图像识别的准确率...',
            category: 'cs-ai',
            subcategory: 'computer-vision',
            publishDate: '2024-01-15',
            evaluation: {
              innovation: 8.5,
              methodology: 7.8,
              impact: 9.2,
              clarity: 8.0,
              reproducibility: 7.5,
              significance: 8.8,
              overall: 8.3,
            },
            stats: {
              likes: 156,
              comments: 42,
              shares: 28,
              views: 1240,
              citations: 89,
            },
          },
          {
            id: 2,
            title: '自然语言处理中的注意力机制优化',
            authors: ['赵六', '钱七'],
            abstract: '本文提出了一种改进的注意力机制，显著提升了NLP模型的性能...',
            category: 'cs-ai',
            subcategory: 'nlp',
            publishDate: '2024-01-10',
            evaluation: {
              innovation: 9.0,
              methodology: 8.5,
              impact: 8.8,
              clarity: 9.2,
              reproducibility: 8.0,
              significance: 9.1,
              overall: 8.8,
            },
            stats: {
              likes: 203,
              comments: 67,
              shares: 45,
              views: 1560,
              citations: 112,
            },
          },
        ];
        
        setPapers(mockPapers);
      }
    } catch (error) {
      setError('Failed to load papers');
      console.error('Error loading papers:', error);
    } finally {
      setLoadingState(false);
    }
  };

  return {
    papers,
    loading,
    refetch: loadPapers,
  };
};

export const useAnalyses = () => {
  const { analyses, setAnalyses, setLoading, setError } = useAppStore();
  const [loading, setLoadingState] = useState(false);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      setLoadingState(true);
      setError(null);
      
      // Fetch analyses from API
      const response = await fetch('/api/analyses');
      if (response.ok) {
        const data = await response.json();
        setAnalyses(data.data || []);
      } else {
        // Fallback to mock data if API fails
        const mockAnalyses: Analysis[] = [
          {
            id: 1,
            paper: {
              id: 1,
              title: '深度学习在图像识别中的应用研究',
              authors: ['张三', '李四', '王五'],
              abstract: '本研究提出了一种新的深度学习架构...',
              category: 'cs-ai',
              subcategory: 'computer-vision',
              publishDate: '2024-01-15',
              evaluation: {
                innovation: 8.5,
                methodology: 7.8,
                impact: 9.2,
                clarity: 8.0,
                reproducibility: 7.5,
                significance: 8.8,
                overall: 8.3,
              },
              stats: {
                likes: 156,
                comments: 42,
                shares: 28,
                views: 1240,
                citations: 89,
              },
            },
            overallScore: 8.3,
            rank: 5,
            percentile: 85,
            trend: 2.5,
            dimensions: {
              innovation: 8.5,
              methodology: 7.8,
              impact: 9.2,
              clarity: 8.0,
              reproducibility: 7.5,
              significance: 8.8,
              overall: 8.3,
            },
            summary: '该论文在图像识别领域做出了重要贡献，提出的新架构显著提升了识别准确率。',
            keyFindings: [
              {
                id: '1',
                icon: '🎯',
                title: '创新性突出',
                description: '提出的新型深度学习架构在多个基准测试中表现优异。',
              },
            ],
          },
        ];
        
        setAnalyses(mockAnalyses);
      }
    } catch (error) {
      setError('Failed to load analyses');
      console.error('Error loading analyses:', error);
    } finally {
      setLoadingState(false);
    }
  };

  return {
    analyses,
    loading,
    refetch: loadAnalyses,
  };
};