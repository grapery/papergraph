import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const taskId = formData.get('task_id');
    const isPublic = formData.get('is_public');

    if (!taskId) {
      return NextResponse.json(
        { code: 1, message: '任务ID不能为空' },
        { status: 400 }
      );
    }

    if (isPublic === null || isPublic === undefined) {
      return NextResponse.json(
        { code: 1, message: '公开状态不能为空' },
        { status: 400 }
      );
    }

    const isPublicBool = isPublic === '1' || isPublic === 'true';

    // Mock public status update - in real implementation, this would:
    // 1. Validate user permissions
    // 2. Update task public status in database
    // 3. Return updated status

    const mockResult = {
      taskId: parseInt(taskId as string),
      isPublic: isPublicBool,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      code: 0,
      message: `设置${isPublicBool ? '公开' : '私有'}成功`,
      data: mockResult
    });
  } catch (error) {
    console.error('设置公开状态失败:', error);
    return NextResponse.json(
      { code: 1, message: '设置公开状态失败' },
      { status: 500 }
    );
  }
}