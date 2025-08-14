import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { mockUserDb } from '@/lib/mockDb';

export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // Find user by email (in real app, query database by userId)
    const userData = mockUserDb.getUserByEmail(user.email);
    
    if (!userData) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // Return user data without sensitive information
    return NextResponse.json({
      data: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        institution: userData.institution,
        position: userData.position,
        field: userData.field,
        avatar: userData.avatar,
        stats: userData.stats,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}