import { pool } from '@/db/config';
import { NextRequest, NextResponse } from 'next/server';

// 获取所有图书
export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM books ORDER BY created_at DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('获取图书失败:', error);
    return NextResponse.json(
      { error: '获取图书失败' },
      { status: 500 }
    );
  }
}

// 创建新图书
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, author, isbn, publisher, publish_date, category, description, stock } = body;
    
    const result = await pool.query(
      `INSERT INTO books (
        title, author, isbn, publisher, publish_date, category, description, stock
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [title, author, isbn, publisher, publish_date, category, description, stock]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error: unknown) {
    console.error('创建图书失败:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: '创建图书失败' },
      { status: 500 }
    );
  }
} 