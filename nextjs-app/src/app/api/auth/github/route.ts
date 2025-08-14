import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock GitHub login redirect
    const redirectUrl = 'https://github.com/login/oauth/authorize?' + new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID || 'mock_client_id',
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/github/callback`,
      scope: 'user:email',
      state: Math.random().toString(36).substring(7)
    });

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('GitHub登录失败:', error);
    return NextResponse.json(
      { code: 1, message: 'GitHub登录失败' },
      { status: 500 }
    );
  }
}