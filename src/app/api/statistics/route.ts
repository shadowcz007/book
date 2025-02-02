import { pool } from '@/db/config';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      // 获取基础统计数据
      const [
        booksResult,
        usersResult,
        activeLoansResult,
        popularBooksResult
      ] = await Promise.all([
        // 总图书数
        client.query('SELECT COUNT(*) FROM books'),
        
        // 总用户数
        client.query('SELECT COUNT(*) FROM users'),
        
        // 当前借阅数
        client.query(`
          SELECT COUNT(*) 
          FROM borrow_records 
          WHERE status = 'borrowed'
        `),
        
        // 热门图书排行(借阅次数最多的5本)
        client.query(`
          SELECT 
            b.id,
            b.title,
            COUNT(br.id) as borrow_count
          FROM books b
          LEFT JOIN borrow_records br ON b.id = br.book_id
          GROUP BY b.id, b.title
          ORDER BY borrow_count DESC
          LIMIT 5
        `)
      ]);

      return NextResponse.json({
        totalBooks: parseInt(booksResult.rows[0].count),
        totalUsers: parseInt(usersResult.rows[0].count),
        activeLoans: parseInt(activeLoansResult.rows[0].count),
        popularBooks: popularBooksResult.rows.map(book => ({
          bookId: book.id,
          title: book.title,
          borrowCount: parseInt(book.borrow_count)
        }))
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json(
      { error: '获取统计数据失败' },
      { status: 500 }
    );
  }
} 