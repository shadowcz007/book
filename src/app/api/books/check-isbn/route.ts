import { pool } from '@/db/config';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isbn = searchParams.get('isbn');

  if (!isbn) {
    return NextResponse.json(
      { error: 'ISBN参数是必需的' },
      { status: 400 }
    );
  }

  try {
    const result = await pool.query(
      'SELECT EXISTS(SELECT 1 FROM books WHERE isbn = $1)',
      [isbn]
    );
    
    return NextResponse.json({ exists: result.rows[0].exists });
  } catch (error) {
    console.error('检查ISBN失败:', error);
    return NextResponse.json(
      { error: '检查ISBN失败' },
      { status: 500 }
    );
  }
} 