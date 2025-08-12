import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock Google login redirect
    const redirectUrl = 'https://accounts.google.com/oauth2/v2/auth?' + new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || 'mock_client_id',
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/google/callback`,
      response_type: 'code',
      scope: 'email profile',
      access_type: 'offline',
      prompt: 'consent'
    });

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Google登录失败:', error);
    return NextResponse.json(
      { code: 1, message: 'Google登录失败' },
      { status: 500 }
    );
  }
}