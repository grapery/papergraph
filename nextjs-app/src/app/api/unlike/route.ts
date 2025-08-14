import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const taskId = formData.get('task_id');

    if (!taskId) {
      return NextResponse.json(
        { code: 1, message: '任务ID不能为空' },
        { status: 400 }
      );
    }

    // Mock unlike result - in real implementation, this would:
    // 1. Remove like record from database
    // 2. Update task like count
    // 3. Return updated stats

    const mockResult = {
      taskId: parseInt(taskId as string),
      liked: false,
      likeCount: Math.floor(Math.random() * 200),
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      code: 0,
      message: '取消点赞成功',
      data: mockResult
    });
  } catch (error) {
    console.error('取消点赞失败:', error);
    return NextResponse.json(
      { code: 1, message: '取消点赞失败' },
      { status: 500 }
    );
  }
}