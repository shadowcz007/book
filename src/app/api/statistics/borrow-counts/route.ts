import { pool } from '@/db/config';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      // 获取热门图书统计
      const popularBooksQuery = `
        SELECT 
          b.id as "bookId",
          b.title,
          COUNT(br.id) as "borrowCount"
        FROM books b
        LEFT JOIN borrow_records br ON b.id = br.book_id
        GROUP BY b.id, b.title
        ORDER BY "borrowCount" DESC
        LIMIT 5
      `;
      
      // 获取总体统计
      const statsQuery = `
        SELECT
          (SELECT COUNT(*) FROM books) as "totalBooks",
          (SELECT COUNT(*) FROM users) as "totalUsers",
          (SELECT COUNT(*) FROM borrow_records WHERE status = 'borrowed') as "activeLoans"
      `;
      
      const [popularBooks, stats] = await Promise.all([
        client.query(popularBooksQuery),
        client.query(statsQuery)
      ]);
      
      return NextResponse.json({
        popularBooks: popularBooks.rows,
        ...stats.rows[0]
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('获取借阅统计失败:', error);
    return NextResponse.json(
      { error: '获取借阅统计失败' },
      { status: 500 }
    );
  }
} 