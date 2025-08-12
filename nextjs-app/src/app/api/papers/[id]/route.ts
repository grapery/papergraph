import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paperId = params.id;

    // Mock paper data - in real implementation, this would come from database
    const mockPaper = {
      id: parseInt(paperId),
      title: '深度学习在图像识别中的应用研究',
      authors: ['张三', '李四', '王五'],
      abstract: '本研究提出了一种新的深度学习架构，用于提高图像识别的准确率。通过大量的实验验证，我们的方法在多个基准测试中都取得了优异的性能表现...',
      category: 'cs-ai',
      subcategory: 'computer-vision',
      publishDate: '2024-01-15',
      doi: '10.1000/doi123456',
      journal: '计算机学报',
      volume: '47',
      number: '3',
      pages: '123-145',
      citations: 89,
      downloads: 1240,
      views: 2341,
      evaluation: {
        innovation: 8.5,
        methodology: 7.8,
        impact: 9.2,
        clarity: 8.0,
        reproducibility: 7.5,
        significance: 8.8,
        overall: 8.3
      },
      stats: {
        likes: 156,
        comments: 42,
        shares: 28,
        views: 1240,
        citations: 89
      },
      tags: ['深度学习', '图像识别', '计算机视觉', '神经网络'],
      references: 45,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z'
    };

    return NextResponse.json({
      code: 0,
      message: '获取论文详情成功',
      data: mockPaper
    });
  } catch (error) {
    console.error('获取论文详情失败:', error);
    return NextResponse.json(
      { code: 1, message: '获取论文详情失败' },
      { status: 500 }
    );
  }
}