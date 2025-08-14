import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { mockArticleDb } from '@/lib/mockArticleDb';

// Schema validation for tag creation
const createTagSchema = z.object({
  name: z.string().min(1, '标签名称不能为空'),
  description: z.string().optional(),
  color: z.string().min(1, '标签颜色不能为空'),
  category: z.string().min(1, '标签分类不能为空'),
});

const updateTagSchema = z.object({
  name: z.string().min(1, '标签名称不能为空').optional(),
  description: z.string().optional(),
  color: z.string().min(1, '标签颜色不能为空').optional(),
  category: z.string().min(1, '标签分类不能为空').optional(),
});

export const dynamic = 'force-dynamic';

// GET /api/tags - Get all tags or tags by category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let tags;
    if (category) {
      tags = mockArticleDb.getTagsByCategory(category);
    } else {
      tags = mockArticleDb.getAllTags();
    }

    return NextResponse.json({
      code: 0,
      message: '获取标签列表成功',
      data: tags
    });
  } catch (error) {
    console.error('获取标签列表失败:', error);
    return NextResponse.json(
      { code: 1, message: '获取标签列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/tags - Create a new tag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = createTagSchema.parse(body);
    
    // Check if tag already exists
    const existingTag = mockArticleDb.getTagByName(validatedData.name);
    if (existingTag) {
      return NextResponse.json(
        { error: '标签已存在' },
        { status: 400 }
      );
    }

    // Create tag
    const tag = mockArticleDb.createTag(validatedData);

    return NextResponse.json({
      code: 0,
      message: '创建标签成功',
      data: tag
    });
  } catch (error) {
    console.error('创建标签失败:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '创建标签失败' },
      { status: 500 }
    );
  }
}

// PUT /api/tags/:id - Update a tag
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tagId = parseInt(searchParams.get('id') || '');
    
    if (!tagId || isNaN(tagId)) {
      return NextResponse.json(
        { error: '标签ID无效' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = updateTagSchema.parse(body);
    
    // Check if tag exists
    const existingTag = mockArticleDb.getTag(tagId);
    if (!existingTag) {
      return NextResponse.json(
        { error: '标签不存在' },
        { status: 404 }
      );
    }

    // Check if new name conflicts with existing tag
    if (validatedData.name && validatedData.name !== existingTag.name) {
      const nameConflict = mockArticleDb.getTagByName(validatedData.name);
      if (nameConflict) {
        return NextResponse.json(
          { error: '标签名称已存在' },
          { status: 400 }
        );
      }
    }

    // For simplicity, we'll recreate the tag with updated data
    // In a real database, you would update the existing record
    mockArticleDb.deleteTag(tagId);
    const updatedTag = mockArticleDb.createTag({
      ...existingTag,
      ...validatedData
    });

    return NextResponse.json({
      code: 0,
      message: '更新标签成功',
      data: updatedTag
    });
  } catch (error) {
    console.error('更新标签失败:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '更新标签失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/tags/:id - Delete a tag
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tagId = parseInt(searchParams.get('id') || '');
    
    if (!tagId || isNaN(tagId)) {
      return NextResponse.json(
        { error: '标签ID无效' },
        { status: 400 }
      );
    }

    const success = mockArticleDb.deleteTag(tagId);
    
    if (!success) {
      return NextResponse.json(
        { error: '标签不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: 0,
      message: '删除标签成功'
    });
  } catch (error) {
    console.error('删除标签失败:', error);
    return NextResponse.json(
      { error: '删除标签失败' },
      { status: 500 }
    );
  }
}