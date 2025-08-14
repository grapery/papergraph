import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const taskId = formData.get('task_id');
    const content = formData.get('content');

    if (!taskId) {
      return NextResponse.json(
        { code: 1, message: '任务ID不能为空' },
        { status: 400 }
      );
    }

    // Mock comment creation - in real implementation, this would:
    // 1. Validate user permissions
    // 2. Save comment to database
    // 3. Update task statistics
    // 4. Return created comment

    const mockComment = {
      id: Math.floor(Math.random() * 1000) + 1,
      taskId: parseInt(taskId as string),
      userId: 1, // Mock user ID
      content: content || '强烈建议读原文',
      type: 'suggestion',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        likes: 0,
        replies: 0
      },
      user: {
        id: 1,
        username: 'demo_user',
        displayName: '演示用户',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo_user'
      }
    };

    return NextResponse.json({
      code: 0,
      message: '评论成功',
      data: mockComment
    });
  } catch (error) {
    console.error('评论失败:', error);
    return NextResponse.json(
      { code: 1, message: '评论失败' },
      { status: 500 }
    );
  }
}