import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Mock analyses data
    const mockAnalyses = [
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

    return NextResponse.json({
      code: 0,
      message: '获取分析成功',
      data: mockAnalyses
    });
  } catch (error) {
    console.error('获取分析失败:', error);
    return NextResponse.json(
      { code: 1, message: '获取分析失败' },
      { status: 500 }
    );
  }
}