import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { mockUserDb } from '@/lib/mockDb';

// Schema validation
const forgotPasswordSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, '重置令牌不能为空'),
  newPassword: z.string().min(6, '新密码至少6个字符'),
});

// JWT Secret (in real app, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Mock email sending function (in real app, use a real email service)
async function sendResetEmail(email: string, resetToken: string) {
  // In a real application, you would send an actual email
  console.log(`Sending reset email to ${email}`);
  console.log(`Reset token: ${resetToken}`);
  console.log(`Reset link: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`);
  
  // For demo purposes, we'll just log the reset link
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'forgot') {
      // Validate input
      const validatedData = forgotPasswordSchema.parse(body);
      
      // Find user (in real app, query database)
      const user = mockUserDb.getUserByEmail(validatedData.email);
      if (!user) {
        // Don't reveal whether email exists for security
        return NextResponse.json({
          message: '如果该邮箱地址存在，您将收到重置密码的邮件',
        });
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { email: validatedData.email },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Store reset token
      mockUserDb.createResetToken(validatedData.email, resetToken);

      // Send reset email
      await sendResetEmail(validatedData.email, resetToken);

      return NextResponse.json({
        message: '如果该邮箱地址存在，您将收到重置密码的邮件',
      });

    } else if (action === 'reset') {
      // Validate input
      const validatedData = resetPasswordSchema.parse(body);
      
      // Verify reset token
      try {
        const decoded = jwt.verify(validatedData.token, JWT_SECRET) as { email: string };
        const email = decoded.email;
        
        // Check if token exists and is valid
        const tokenEmail = mockUserDb.getEmailByResetToken(validatedData.token);
        if (!tokenEmail || tokenEmail !== email) {
          return NextResponse.json(
            { error: '重置令牌无效或已过期' },
            { status: 400 }
          );
        }

        // Find user
        const user = mockUserDb.getUserByEmail(email);
        if (!user) {
          return NextResponse.json(
            { error: '用户不存在' },
            { status: 404 }
          );
        }

        // Hash new password
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(validatedData.newPassword, 12);

        // Update user password
        mockUserDb.updateUser(email, { password: hashedPassword });

        // Remove used reset token
        mockUserDb.removeResetToken(validatedData.token);

        return NextResponse.json({
          message: '密码重置成功',
        });

      } catch (error) {
        return NextResponse.json(
          { error: '重置令牌无效或已过期' },
          { status: 400 }
        );
      }

    } else {
      return NextResponse.json(
        { error: '无效的操作' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Password reset error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}