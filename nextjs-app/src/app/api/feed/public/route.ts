import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderBy = searchParams.get('order_by') || '';

    // Mock public feed data - in real implementation, this would come from database
    const mockAnalyses = Array.from({ length: 20 }, (_, index) => ({
      id: index + 1,
      paper: {
        id: index + 1,
        title: `论文标题 ${index + 1}`,
        authors: ['作者一', '作者二', '作者三'],
        abstract: '这是一篇关于深度学习在图像识别中应用的论文摘要...',
        category: 'cs-ai',
        publishDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        evaluation: {
          innovation: 7 + Math.random() * 2,
          methodology: 7 + Math.random() * 2,
          impact: 7 + Math.random() * 2,
          clarity: 7 + Math.random() * 2,
          reproducibility: 7 + Math.random() * 2,
          significance: 7 + Math.random() * 2,
          overall: 7 + Math.random() * 2
        }
      },
      analysis: {
        id: index + 1,
        taskId: index + 1,
        overallScore: 7 + Math.random() * 2,
        rank: Math.floor(Math.random() * 100) + 1,
        percentile: Math.floor(Math.random() * 100),
        trend: (Math.random() - 0.5) * 10,
        summary: '该论文在多个维度上表现出色，具有较高的学术价值和应用前景。',
        keyFindings: [
          {
            id: '1',
            icon: '🎯',
            title: '创新性突出',
            description: '提出的新型方法在多个基准测试中表现优异。'
          },
          {
            id: '2',
            icon: '📊',
            title: '实验充分',
            description: '通过大量的对比实验验证了方法的有效性。'
          }
        ],
        strengths: [
          {
            id: '1',
            icon: '💡',
            title: '技术创新',
            score: 8.5,
            description: '提出的新架构在理论上具有创新性。',
            evidence: ['新的注意力机制', '高效的特征提取']
          }
        ],
        weaknesses: [
          {
            id: '1',
            icon: '⚠️',
            title: '计算复杂度',
            score: 6.8,
            description: '计算复杂度较高，可能影响实际应用。',
            suggestions: ['模型压缩', '轻量化设计']
          }
        ],
        recommendations: [
          {
            id: '1',
            priority: 'high',
            title: '优化计算效率',
            description: '建议研究模型的优化方法。',
            impact: '显著提升实用性'
          }
        ],
        isPublic: true,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      stats: {
        likes: Math.floor(Math.random() * 200),
        comments: Math.floor(Math.random() * 50),
        shares: Math.floor(Math.random() * 30),
        views: Math.floor(Math.random() * 1000),
        suggestions: Math.floor(Math.random() * 20)
      },
      user: {
        id: Math.floor(Math.random() * 100) + 1,
        username: `user${index + 1}`,
        displayName: `用户${index + 1}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${index + 1}`
      }
    }));

    // Sort based on order_by parameter
    let sortedAnalyses = [...mockAnalyses];
    switch (orderBy) {
      case 'like':
        sortedAnalyses.sort((a, b) => b.stats.likes - a.stats.likes);
        break;
      case 'suggest':
        sortedAnalyses.sort((a, b) => b.stats.suggestions - a.stats.suggestions);
        break;
      default:
        // Sort by creation date (newest first)
        sortedAnalyses.sort((a, b) => 
          new Date(b.analysis.createdAt).getTime() - new Date(a.analysis.createdAt).getTime()
        );
    }

    return NextResponse.json({
      code: 0,
      message: '获取公开分析成功',
      data: sortedAnalyses
    });
  } catch (error) {
    console.error('获取公开分析失败:', error);
    return NextResponse.json(
      { code: 1, message: '获取公开分析失败' },
      { status: 500 }
    );
  }
}