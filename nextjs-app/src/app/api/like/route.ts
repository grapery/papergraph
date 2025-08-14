import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 支持JSON和FormData两种格式
    let taskId;
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      const body = await request.json();
      taskId = body.task_id;
    } else {
      const formData = await request.formData();
      taskId = formData.get('task_id');
    }

    if (!taskId) {
      return NextResponse.json(
        { code: 1, message: '任务ID不能为空' },
        { status: 400 }
      );
    }

    // Mock like result - in real implementation, this would:
    // 1. Check if user already liked this task
    // 2. Create like record in database
    // 3. Update task like count
    // 4. Return updated stats

    const mockResult = {
      taskId: parseInt(taskId as string),
      liked: true,
      likeCount: Math.floor(Math.random() * 200) + 1,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      code: 0,
      message: '点赞成功',
      data: mockResult
    });
  } catch (error) {
    console.error('点赞失败:', error);
    return NextResponse.json(
      { code: 1, message: '点赞失败' },
      { status: 500 }
    );
  }
}