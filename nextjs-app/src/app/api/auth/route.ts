import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { mockUserDb } from '@/lib/mockDb';

// Schema validation
const registerSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6个字符'),
  institution: z.string().optional(),
  position: z.string().optional(),
  field: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
});

// JWT Secret (in real app, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'register') {
      // Validate input
      const validatedData = registerSchema.parse(body);
      
      // Check if user already exists
      if (mockUserDb.emailExists(validatedData.email)) {
        return NextResponse.json(
          { error: '该邮箱已被注册' },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 12);

      // Create user
      const user = mockUserDb.createUser({
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        institution: validatedData.institution || '',
        position: validatedData.position || '',
        field: validatedData.field || '',
        avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${validatedData.email}`,
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        message: '注册成功',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            institution: user.institution,
            position: user.position,
            field: user.field,
            avatar: user.avatar,
            stats: user.stats,
          },
          token,
        }
      });

    } else if (action === 'login') {
      // Validate input
      const validatedData = loginSchema.parse(body);
      
      // Find user
      const user = mockUserDb.getUserByEmail(validatedData.email);
      if (!user) {
        return NextResponse.json(
          { error: '邮箱或密码错误' },
          { status: 401 }
        );
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: '邮箱或密码错误' },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        message: '登录成功',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            institution: user.institution,
            position: user.position,
            field: user.field,
            avatar: user.avatar,
            stats: user.stats,
          },
          token,
        }
      });

    } else {
      return NextResponse.json(
        { error: '无效的操作' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Auth error:', error);
    
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