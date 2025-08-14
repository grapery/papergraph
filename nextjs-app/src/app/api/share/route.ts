import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paper_id, task_id } = body;

    if (!paper_id && !task_id) {
      return NextResponse.json(
        { code: 1, message: '论文ID或任务ID不能为空' },
        { status: 400 }
      );
    }

    // Mock share result - in real implementation, this would:
    // 1. Create share record in database
    // 2. Update share count
    // 3. Track user activity

    const mockResult = {
      paperId: paper_id || parseInt(task_id),
      shared: true,
      shareCount: Math.floor(Math.random() * 50) + 1,
      shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/papers/${paper_id || task_id}`,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      code: 0,
      message: '分享成功',
      data: mockResult
    });
  } catch (error) {
    console.error('分享失败:', error);
    return NextResponse.json(
      { code: 1, message: '分享失败' },
      { status: 500 }
    );
  }
}