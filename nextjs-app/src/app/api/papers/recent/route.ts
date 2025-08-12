import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Mock recent papers - in real implementation, this would come from database
    const mockPapers = Array.from({ length: limit }, (_, index) => ({
      id: index + 1,
      title: `最新论文 ${index + 1}`,
      authors: ['作者一', '作者二'],
      abstract: '这是一篇最新发表的论文摘要，代表了该领域的最新研究进展...',
      category: ['cs-ai', 'cs-system', 'bio-med', 'physics', 'math'][Math.floor(Math.random() * 5)],
      publishDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      evaluation: {
        innovation: 7 + Math.random() * 2,
        methodology: 7 + Math.random() * 2,
        impact: 7 + Math.random() * 2,
        clarity: 7 + Math.random() * 2,
        reproducibility: 7 + Math.random() * 2,
        significance: 7 + Math.random() * 2,
        overall: 7 + Math.random() * 2
      },
      stats: {
        likes: Math.floor(Math.random() * 100),
        comments: Math.floor(Math.random() * 30),
        shares: Math.floor(Math.random() * 20),
        views: Math.floor(Math.random() * 500),
        citations: Math.floor(Math.random() * 20)
      },
      isRecent: true
    }));

    // Sort by publish date (newest first)
    const sortedPapers = mockPapers.sort((a, b) => 
      new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );

    return NextResponse.json({
      code: 0,
      message: '获取最新论文成功',
      data: sortedPapers
    });
  } catch (error) {
    console.error('获取最新论文失败:', error);
    return NextResponse.json(
      { code: 1, message: '获取最新论文失败' },
      { status: 500 }
    );
  }
}