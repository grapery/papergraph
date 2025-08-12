import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Mock popular papers - in real implementation, this would come from database
    const mockPapers = Array.from({ length: limit }, (_, index) => ({
      id: index + 1,
      title: `热门论文 ${index + 1}`,
      authors: ['作者一', '作者二', '作者三'],
      abstract: '这是一篇热门论文的摘要，在学术界引起了广泛关注...',
      category: ['cs-ai', 'cs-system', 'bio-med', 'physics', 'chemistry'][Math.floor(Math.random() * 5)],
      publishDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      evaluation: {
        innovation: 8 + Math.random() * 1.5,
        methodology: 8 + Math.random() * 1.5,
        impact: 8 + Math.random() * 1.5,
        clarity: 8 + Math.random() * 1.5,
        reproducibility: 8 + Math.random() * 1.5,
        significance: 8 + Math.random() * 1.5,
        overall: 8 + Math.random() * 1.5
      },
      stats: {
        likes: Math.floor(Math.random() * 500) + 100,
        comments: Math.floor(Math.random() * 100) + 20,
        shares: Math.floor(Math.random() * 80) + 10,
        views: Math.floor(Math.random() * 2000) + 500,
        citations: Math.floor(Math.random() * 200) + 50
      },
      isPopular: true,
      trendingScore: Math.random() * 100
    }));

    // Sort by popularity score (likes + comments + shares)
    const sortedPapers = mockPapers.sort((a, b) => 
      (b.stats.likes + b.stats.comments + b.stats.shares) - 
      (a.stats.likes + a.stats.comments + a.stats.shares)
    );

    return NextResponse.json({
      code: 0,
      message: '获取热门论文成功',
      data: sortedPapers
    });
  } catch (error) {
    console.error('获取热门论文失败:', error);
    return NextResponse.json(
      { code: 1, message: '获取热门论文失败' },
      { status: 500 }
    );
  }
}