import { pool } from '@/db/config';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
// 获取所有用户
export async function GET() {
  try {
    const result = await pool.query(
      'SELECT id, username, email, role, created_at FROM users'
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return NextResponse.json(
      { error: '获取用户列表失败' },
      { status: 500 }
    );
  }
}

// 创建新用户
export async function POST(request: Request) {
    try {
      const body = await request.json();
      const { username, email, password } = body;
      
      // 对密码进行加密
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = await pool.query(
        `INSERT INTO users (username, email, password, role)
         VALUES ($1, $2, $3, 'user')
         RETURNING id, username, email, role, created_at`,
        [username, email, hashedPassword]
      );
      
      return NextResponse.json(result.rows[0]);
    } catch (error: any) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: '用户名或邮箱已存在' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: '创建用户失败' },
        { status: 500 }
      );
    }
  }