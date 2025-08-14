import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { mockUserDb } from '@/lib/mockDb';

// GitHub OAuth callback handler
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth?error=github_auth_failed`);
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth?error=missing_code`);
    }

    // In production, you would exchange the code for tokens with GitHub
    // For now, we'll create a mock GitHub user
    const mockGithubUser = {
      id: Date.now(),
      name: 'GitHub User',
      email: `user${Date.now()}@github.com`,
      avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=github${Date.now()}`,
      provider: 'github',
      providerId: `github_${Date.now()}`,
    };

    // Check if user exists, if not create one
    let user = mockUserDb.getUserByEmail(mockGithubUser.email);
    
    if (!user) {
      user = mockUserDb.createUser({
        name: mockGithubUser.name,
        email: mockGithubUser.email,
        password: '', // OAuth users don't have passwords
        avatar: mockGithubUser.avatar,
        provider: 'github',
        providerId: mockGithubUser.providerId,
      });
    }

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect to home with token in URL (in production, use secure cookies)
    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/home?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    }))}`;

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth?error=server_error`);
  }
}