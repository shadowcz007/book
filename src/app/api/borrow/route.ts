import { pool } from '@/db/config';
import { NextResponse } from 'next/server';

// 获取借阅记录
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    let query = `
      SELECT 
        br.*,
        b.title as book_title,
        b.author as book_author,
        u.username as username,
        TO_CHAR(br.borrow_date, 'YYYY-MM-DD') as borrow_date,
        TO_CHAR(br.due_date, 'YYYY-MM-DD') as due_date,
        TO_CHAR(br.return_date, 'YYYY-MM-DD') as return_date
      FROM borrow_records br
      JOIN books b ON br.book_id = b.id
      JOIN users u ON br.user_id = u.id
    `;
    
    const params = [];
    if (userId) {
      query += ` WHERE br.user_id = $1`;
      params.push(userId);
    }
    
    query += ` ORDER BY br.created_at DESC`;
    
    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('获取借阅记录失败:', error);
    return NextResponse.json(
      { error: '获取借阅记录失败' },
      { status: 500 }
    );
  }
}

// 创建借阅记录
export async function POST(request: Request) {
  try {
    const { bookId, userId } = await request.json();
    
    // 确保 bookId 和 userId 是数字类型
    const bookIdNum = parseInt(bookId);
    const userIdNum = parseInt(userId);

    if (isNaN(bookIdNum) || isNaN(userIdNum)) {
      return NextResponse.json(
        { error: '无效的图书ID或用户ID' },
        { status: 400 }
      );
    }
    
    // 检查图书是否可借
    const bookResult = await pool.query(
      'SELECT stock FROM books WHERE id = $1',
      [bookIdNum]
    );
    
    if (bookResult.rows.length === 0) {
      return NextResponse.json(
        { error: '图书不存在' },
        { status: 404 }
      );
    }
    
    if (bookResult.rows[0].stock <= 0) {
      return NextResponse.json(
        { error: '图书库存不足' },
        { status: 400 }
      );
    }
    
    // 创建借阅记录并更新库存
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // 创建借阅记录
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 默认借阅期限14天
      
      const borrowResult = await client.query(
        `INSERT INTO borrow_records (book_id, user_id, due_date, status)
         VALUES ($1, $2, $3, 'borrowed')
         RETURNING *`,
        [bookIdNum, userIdNum, dueDate]
      );
      
      // 更新图书库存
      await client.query(
        'UPDATE books SET stock = stock - 1 WHERE id = $1',
        [bookIdNum]
      );
      
      await client.query('COMMIT');
      return NextResponse.json(borrowResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('创建借阅记录失败:', error);
    return NextResponse.json(
      { error: '创建借阅记录失败' },
      { status: 500 }
    );
  }
} 