import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock active tasks - in real implementation, this would come from database
    const mockTasks = Array.from({ length: 5 }, (_, index) => ({
      id: index + 1,
      paperId: index + 1,
      title: `活跃任务 ${index + 1}`,
      status: 'processing',
      type: 'analysis',
      progress: Math.floor(Math.random() * 100),
      createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
      estimatedTime: 300,
      paper: {
        id: index + 1,
        title: `论文标题 ${index + 1}`,
        authors: ['作者一', '作者二'],
        category: 'cs-ai'
      }
    }));

    return NextResponse.json({
      code: 0,
      message: '获取活跃任务成功',
      data: mockTasks
    });
  } catch (error) {
    console.error('获取活跃任务失败:', error);
    return NextResponse.json(
      { code: 1, message: '获取活跃任务失败' },
      { status: 500 }
    );
  }
}