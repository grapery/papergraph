import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category');
    
    // Mock papers data
    const mockPapers = [
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
      {
        id: 3,
        title: '分布式系统的一致性协议研究',
        authors: ['孙八', '周九'],
        abstract: '本文研究了一种新的分布式系统一致性协议，提高了系统的可靠性和性能...',
        category: 'cs-system',
        subcategory: 'distributed-systems',
        publishDate: '2024-01-08',
        evaluation: {
          innovation: 8.2,
          methodology: 8.8,
          impact: 8.5,
          clarity: 8.6,
          reproducibility: 8.2,
          significance: 8.7,
          overall: 8.5,
        },
        stats: {
          likes: 134,
          comments: 38,
          shares: 22,
          views: 980,
          citations: 76,
        },
      },
    ];

    // Filter by category if specified
    let filteredPapers = mockPapers;
    if (categoryId) {
      filteredPapers = mockPapers.filter(paper => paper.category === categoryId);
    }

    return NextResponse.json({
      code: 0,
      message: '获取论文成功',
      data: filteredPapers
    });
  } catch (error) {
    console.error('获取论文失败:', error);
    return NextResponse.json(
      { code: 1, message: '获取论文失败' },
      { status: 500 }
    );
  }
}