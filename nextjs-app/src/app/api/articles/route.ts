import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { mockArticleDb } from '@/lib/mockArticleDb';

// Schema validation for article creation
const createArticleSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  authors: z.array(z.string()).min(1, '至少需要一个作者'),
  authorString: z.string().min(1, '作者字符串不能为空'),
  abstract: z.string().min(1, '摘要不能为空'),
  publishDate: z.string().min(1, '发布日期不能为空'),
  publishYear: z.number().min(1900).max(new Date().getFullYear() + 1),
  source: z.string().optional(),
  doi: z.string().optional(),
  url: z.string().url('URL格式不正确').optional().or(z.literal('')),
  pdfUrl: z.string().url('PDF URL格式不正确').optional().or(z.literal('')),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  language: z.enum(['zh', 'en', 'other']).default('zh'),
  wordCount: z.number().min(0).default(0),
});

const updateArticleSchema = z.object({
  title: z.string().min(1, '标题不能为空').optional(),
  authors: z.array(z.string()).min(1, '至少需要一个作者').optional(),
  authorString: z.string().min(1, '作者字符串不能为空').optional(),
  abstract: z.string().min(1, '摘要不能为空').optional(),
  publishDate: z.string().min(1, '发布日期不能为空').optional(),
  publishYear: z.number().min(1900).max(new Date().getFullYear() + 1).optional(),
  source: z.string().optional(),
  doi: z.string().optional(),
  url: z.string().url('URL格式不正确').optional().or(z.literal('')),
  pdfUrl: z.string().url('PDF URL格式不正确').optional().or(z.literal('')),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  language: z.enum(['zh', 'en', 'other']).optional(),
  wordCount: z.number().min(0).optional(),
});

export const dynamic = 'force-dynamic';

// GET /api/articles - Get articles with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      author: searchParams.get('author') || undefined,
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

    return NextResponse.json({
      code: 0,
      message: '获取文章列表成功',
      data: result
    });
  } catch (error) {
    console.error('获取文章列表失败:', error);
    return NextResponse.json(
      { code: 1, message: '获取文章列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/articles - Create a new article
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = createArticleSchema.parse(body);
    
    // Check if article with same URL already exists
    if (validatedData.url) {
      const existingArticle = mockArticleDb.getArticleByUrl(validatedData.url);
      if (existingArticle) {
        return NextResponse.json(
          { error: '该URL的文章已存在' },
          { status: 400 }
        );
      }
    }

    // Create article
    const article = mockArticleDb.createArticle(validatedData);

    return NextResponse.json({
      code: 0,
      message: '创建文章成功',
      data: article
    });
  } catch (error) {
    console.error('创建文章失败:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '创建文章失败' },
      { status: 500 }
    );
  }
}

// PUT /api/articles/:id - Update an article
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = parseInt(searchParams.get('id') || '');
    
    if (!articleId || isNaN(articleId)) {
      return NextResponse.json(
        { error: '文章ID无效' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = updateArticleSchema.parse(body);
    
    // Update article
    const updatedArticle = mockArticleDb.updateArticle(articleId, validatedData);
    
    if (!updatedArticle) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: 0,
      message: '更新文章成功',
      data: updatedArticle
    });
  } catch (error) {
    console.error('更新文章失败:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '更新文章失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/:id - Delete an article
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = parseInt(searchParams.get('id') || '');
    
    if (!articleId || isNaN(articleId)) {
      return NextResponse.json(
        { error: '文章ID无效' },
        { status: 400 }
      );
    }

    const success = mockArticleDb.deleteArticle(articleId);
    
    if (!success) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: 0,
      message: '删除文章成功'
    });
  } catch (error) {
    console.error('删除文章失败:', error);
    return NextResponse.json(
      { error: '删除文章失败' },
      { status: 500 }
    );
  }
}