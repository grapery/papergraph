import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('task_id');

    if (!taskId) {
      return NextResponse.json(
        { code: 1, message: '任务ID不能为空' },
        { status: 400 }
      );
    }

    // Mock task detail - in real implementation, this would come from database
    const mockTaskDetail = {
      id: parseInt(taskId),
      paperId: parseInt(taskId),
      title: `论文分析任务 ${taskId}`,
      status: 'completed',
      type: 'analysis',
      progress: 100,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedTime: 300,
      actualTime: 280,
      paper: {
        id: parseInt(taskId),
        title: '深度学习在图像识别中的应用研究',
        authors: ['张三', '李四', '王五'],
        abstract: '本研究提出了一种新的深度学习架构，用于提高图像识别的准确率...',
        category: 'cs-ai',
        subcategory: 'computer-vision',
        publishDate: '2024-01-15',
        fileName: 'paper.pdf',
        fileSize: 2048576,
        uploadDate: '2024-01-15T00:00:00Z'
      },
      analysis: {
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
          overall: 8.3
        },
        summary: '该论文在图像识别领域做出了重要贡献，提出的新架构显著提升了识别准确率...',
        keyFindings: [
          {
            id: '1',
            icon: '🎯',
            title: '创新性突出',
            description: '提出的新型深度学习架构在多个基准测试中表现优异。'
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
        ]
      },
      isPublic: true,
      stats: {
        likes: 156,
        comments: 42,
        shares: 28,
        views: 1240,
        suggestions: 15
      }
    };

    return NextResponse.json({
      code: 0,
      message: '获取任务详情成功',
      data: mockTaskDetail
    });
  } catch (error) {
    console.error('获取任务详情失败:', error);
    return NextResponse.json(
      { code: 1, message: '获取任务详情失败' },
      { status: 500 }
    );
  }
}