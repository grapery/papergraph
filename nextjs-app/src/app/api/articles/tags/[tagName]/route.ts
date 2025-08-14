import { NextRequest, NextResponse } from 'next/server';
import { mockArticleDb } from '@/lib/mockArticleDb';

export const dynamic = 'force-dynamic';

// GET /api/articles/tags/:tagName - Get articles by tag
export async function GET(
  request: NextRequest,
  { params }: { params: { tagName: string } }
) {
  try {
    const tagName = decodeURIComponent(params.tagName);
    const { searchParams } = new URL(request.url);
    
    const filters = {
      tags: [tagName],
      author: searchParams.get('author') || undefined,
      category: searchParams.get('category') || undefined,
      year: searchParams.get('year') ? {
        start: searchParams.get('yearStart') ? parseInt(searchParams.get('yearStart')!) : undefined,
        end: searchParams.get('yearEnd') ? parseInt(searchParams.get('yearEnd')!) : undefined
      } : undefined,
      language: searchParams.get('language') || undefined,
      minScore: searchParams.get('minScore') ? parseFloat(searchParams.get('minScore')!) : undefined,
      maxScore: searchParams.get('maxScore') ? parseFloat(searchParams.get('maxScore')!) : undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
    };

    const result = mockArticleDb.searchArticles(filters);

    // Get tag information
    const tag = mockArticleDb.getTagByName(tagName);

    return NextResponse.json({
      code: 0,
      message: '获取标签文章成功',
      data: {
        articles: result,
        tagInfo: tag
      }
    });
  } catch (error) {
    console.error('获取标签文章失败:', error);
    return NextResponse.json(
      { code: 1, message: '获取标签文章失败' },
      { status: 500 }
    );
  }
}