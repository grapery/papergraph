import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    if (!query) {
      return NextResponse.json(
        { code: 1, message: '搜索关键词不能为空' },
        { status: 400 }
      );
    }

    // Mock search results - in real implementation, this would search the database
    const mockPapers = Array.from({ length: pageSize }, (_, index) => ({
      id: (page - 1) * pageSize + index + 1,
      title: `${query}相关研究 ${index + 1}`,
      authors: ['作者一', '作者二'],
      abstract: `这是关于${query}的搜索结果论文摘要...`,
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
      },
      stats: {
        likes: Math.floor(Math.random() * 200),
        comments: Math.floor(Math.random() * 50),
        shares: Math.floor(Math.random() * 30),
        views: Math.floor(Math.random() * 1000),
        citations: Math.floor(Math.random() * 100)
      }
    }));

    return NextResponse.json({
      code: 0,
      message: '搜索成功',
      data: {
        papers: mockPapers,
        total: 100, // Mock total count
        page,
        pageSize
      }
    });
  } catch (error) {
    console.error('搜索论文失败:', error);
    return NextResponse.json(
      { code: 1, message: '搜索论文失败' },
      { status: 500 }
    );
  }
}