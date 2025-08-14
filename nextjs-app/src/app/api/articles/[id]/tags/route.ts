import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { mockArticleDb } from '@/lib/mockArticleDb';

// Schema validation for article-tag association
const addTagSchema = z.object({
  tagId: z.number().min(1, '标签ID无效'),
  confidence: z.number().min(0).max(1).default(1.0),
});

const createTagSchema = z.object({
  name: z.string().min(1, '标签名称不能为空'),
  description: z.string().optional(),
  color: z.string().min(1, '标签颜色不能为空'),
  category: z.string().min(1, '标签分类不能为空'),
  confidence: z.number().min(0).max(1).default(1.0),
});

export const dynamic = 'force-dynamic';

// GET /api/articles/:id/tags - Get tags for an article
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = parseInt(params.id);
    
    if (!articleId || isNaN(articleId)) {
      return NextResponse.json(
        { error: '文章ID无效' },
        { status: 400 }
      );
    }

    // Check if article exists
    const article = mockArticleDb.getArticle(articleId);
    if (!article) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }

    const tags = mockArticleDb.getArticleTags(articleId);

    return NextResponse.json({
      code: 0,
      message: '获取文章标签成功',
      data: tags
    });
  } catch (error) {
    console.error('获取文章标签失败:', error);
    return NextResponse.json(
      { code: 1, message: '获取文章标签失败' },
      { status: 500 }
    );
  }
}

// POST /api/articles/:id/tags - Add tag to article
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = parseInt(params.id);
    
    if (!articleId || isNaN(articleId)) {
      return NextResponse.json(
        { error: '文章ID无效' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Check if it's a new tag creation or existing tag association
    if (body.name) {
      // Create new tag and associate
      const validatedData = createTagSchema.parse(body);
      
      // Check if tag already exists
      const existingTag = mockArticleDb.getTagByName(validatedData.name);
      let tagId: number;
      
      if (existingTag) {
        tagId = existingTag.id;
      } else {
        // Create new tag
        const newTag = mockArticleDb.createTag({
          name: validatedData.name,
          description: validatedData.description,
          color: validatedData.color,
          category: validatedData.category
        });
        tagId = newTag.id;
      }
      
      // Associate tag with article
      const articleTag = mockArticleDb.addTagToArticle(articleId, tagId, validatedData.confidence);
      
      if (!articleTag) {
        return NextResponse.json(
          { error: '添加标签失败' },
          { status: 400 }
        );
      }
      
      const tag = mockArticleDb.getTag(tagId);
      
      return NextResponse.json({
        code: 0,
        message: '创建并添加标签成功',
        data: { articleTag, tag }
      });
    } else {
      // Associate existing tag
      const validatedData = addTagSchema.parse(body);
      
      const articleTag = mockArticleDb.addTagToArticle(articleId, validatedData.tagId, validatedData.confidence);
      
      if (!articleTag) {
        return NextResponse.json(
          { error: '添加标签失败' },
          { status: 400 }
        );
      }
      
      const tag = mockArticleDb.getTag(validatedData.tagId);
      
      return NextResponse.json({
        code: 0,
        message: '添加标签成功',
        data: { articleTag, tag }
      });
    }
  } catch (error) {
    console.error('添加文章标签失败:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '添加文章标签失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/:id/tags/:tagId - Remove tag from article
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; tagId: string } }
) {
  try {
    const articleId = parseInt(params.id);
    const tagId = parseInt(params.tagId);
    
    if (!articleId || isNaN(articleId)) {
      return NextResponse.json(
        { error: '文章ID无效' },
        { status: 400 }
      );
    }

    if (!tagId || isNaN(tagId)) {
      return NextResponse.json(
        { error: '标签ID无效' },
        { status: 400 }
      );
    }

    const success = mockArticleDb.removeTagFromArticle(articleId, tagId);
    
    if (!success) {
      return NextResponse.json(
        { error: '移除标签失败' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      code: 0,
      message: '移除标签成功'
    });
  } catch (error) {
    console.error('移除文章标签失败:', error);
    return NextResponse.json(
      { error: '移除文章标签失败' },
      { status: 500 }
    );
  }
}