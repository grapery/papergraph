import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['paperId', 'dimensions'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { code: 1, message: `${field} 不能为空` },
          { status: 400 }
        );
      }
    }

    // Mock evaluation creation - in real implementation, this would:
    // 1. Validate user permissions
    // 2. Save evaluation to database
    // 3. Update paper statistics
    // 4. Return created evaluation

    const mockEvaluation = {
      id: Math.floor(Math.random() * 1000) + 1,
      paperId: body.paperId,
      userId: 1, // Mock user ID
      dimensions: body.dimensions,
      overallScore: body.overallScore || 0,
      comment: body.comment || '',
      isPublic: body.isPublic || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        likes: 0,
        comments: 0,
        helpful: 0
      }
    };

    return NextResponse.json({
      code: 0,
      message: '创建评价成功',
      data: mockEvaluation
    });
  } catch (error) {
    console.error('创建评价失败:', error);
    return NextResponse.json(
      { code: 1, message: '创建评价失败' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    // Mock evaluations - in real implementation, this would come from database
    const mockEvaluations = Array.from({ length: pageSize }, (_, index) => ({
      id: (page - 1) * pageSize + index + 1,
      paperId: Math.floor(Math.random() * 100) + 1,
      userId: Math.floor(Math.random() * 50) + 1,
      title: `论文评价 ${(page - 1) * pageSize + index + 1}`,
      overallScore: 6 + Math.random() * 4,
      dimensions: {
        originality: 6 + Math.random() * 4,
        depth: 6 + Math.random() * 4,
        logic: 6 + Math.random() * 4,
        evidence: 6 + Math.random() * 4,
        language: 6 + Math.random() * 4,
        value: 6 + Math.random() * 4
      },
      comment: '这是一篇很有价值的论文，在多个方面都表现出色...',
      isPublic: true,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      stats: {
        likes: Math.floor(Math.random() * 100),
        comments: Math.floor(Math.random() * 30),
        helpful: Math.floor(Math.random() * 50)
      },
      user: {
        id: Math.floor(Math.random() * 50) + 1,
        username: `user${index + 1}`,
        displayName: `用户${index + 1}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${index + 1}`
      },
      paper: {
        id: Math.floor(Math.random() * 100) + 1,
        title: `论文标题 ${(page - 1) * pageSize + index + 1}`,
        authors: ['作者一', '作者二'],
        category: 'cs-ai'
      }
    }));

    return NextResponse.json({
      code: 0,
      message: '获取评价列表成功',
      data: {
        evaluations: mockEvaluations,
        total: 100,
        page,
        pageSize
      }
    });
  } catch (error) {
    console.error('获取评价列表失败:', error);
    return NextResponse.json(
      { code: 1, message: '获取评价列表失败' },
      { status: 500 }
    );
  }
}