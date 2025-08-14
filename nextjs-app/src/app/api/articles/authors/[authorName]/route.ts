import { NextRequest, NextResponse } from 'next/server';
import { mockArticleDb } from '@/lib/mockArticleDb';

export const dynamic = 'force-dynamic';

// GET /api/articles/authors/:authorName - Get articles by author
export async function GET(
  request: NextRequest,
  { params }: { params: { authorName: string } }
) {
  try {
    const authorName = decodeURIComponent(params.authorName);
    const { searchParams } = new URL(request.url);
    
    const filters = {
      author: authorName,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
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

    // Get author statistics
    const authorStats = mockArticleDb.getAuthorStats(authorName);

    return NextResponse.json({
      code: 0,
      message: '获取作者文章成功',
      data: {
        articles: result,
        authorStats
      }
    });
  } catch (error) {
    console.error('获取作者文章失败:', error);
    return NextResponse.json(
      { code: 1, message: '获取作者文章失败' },
      { status: 500 }
    );
  }
}