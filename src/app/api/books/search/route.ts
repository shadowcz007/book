import { pool } from '@/db/config';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  try {
    const result = await pool.query(
      `SELECT * FROM books 
       WHERE title ILIKE $1 
       OR author ILIKE $1 
       OR isbn ILIKE $1
       ORDER BY created_at DESC`,
      [`%${query}%`]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('搜索图书失败:', error);
    return NextResponse.json(
      { error: '搜索图书失败' },
      { status: 500 }
    );
  }
} 