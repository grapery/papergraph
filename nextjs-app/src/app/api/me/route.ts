import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock user data - in real implementation, this would come from a database
    const mockUser = {
      id: 1,
      username: 'demo_user',
      email: 'demo@example.com',
      displayName: '演示用户',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo_user',
      academicBackground: {
        institution: '示例大学',
        department: '计算机科学',
        position: '研究生'
      },
      interests: ['人工智能', '机器学习', '深度学习'],
      stats: {
        analysesCount: 12,
        followersCount: 45,
        followingCount: 23,
        citationsCount: 156
      },
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z'
    };

    return NextResponse.json({
      code: 0,
      message: '获取用户信息成功',
      data: mockUser
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json(
      { code: 1, message: '获取用户信息失败' },
      { status: 500 }
    );
  }
}