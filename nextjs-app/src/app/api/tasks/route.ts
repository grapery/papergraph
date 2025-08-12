import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock user tasks - in real implementation, this would come from database
    const mockTasks = Array.from({ length: 15 }, (_, index) => ({
      id: index + 1,
      paperId: index + 1,
      title: `论文分析任务 ${index + 1}`,
      status: ['pending', 'processing', 'completed', 'failed'][Math.floor(Math.random() * 4)],
      type: 'analysis',
      progress: Math.floor(Math.random() * 100),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedTime: 300,
      paper: {
        id: index + 1,
        title: `论文标题 ${index + 1}`,
        authors: ['作者一', '作者二'],
        category: 'cs-ai'
      },
      result: null
    }));

    return NextResponse.json({
      code: 0,
      message: '获取任务列表成功',
      data: mockTasks
    });
  } catch (error) {
    console.error('获取任务列表失败:', error);
    return NextResponse.json(
      { code: 1, message: '获取任务列表失败' },
      { status: 500 }
    );
  }
}