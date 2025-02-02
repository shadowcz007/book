import { pool } from '@/db/config';
import { NextRequest, NextResponse } from 'next/server';

// 更新借阅记录（还书/续借）
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { action } = await request.json();
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      if (action === 'return') {
        // 还书操作
        const borrowResult = await client.query(
          `UPDATE borrow_records 
           SET status = 'returned', return_date = CURRENT_TIMESTAMP 
           WHERE id = $1 AND status = 'borrowed'
           RETURNING book_id`,
          [params.id]
        );
        
        if (borrowResult.rows.length === 0) {
          throw new Error('借阅记录不存在或已归还');
        }
        
        // 更新图书库存
        await client.query(
          'UPDATE books SET stock = stock + 1 WHERE id = $1',
          [borrowResult.rows[0].book_id]
        );
      } else if (action === 'renew') {
        // 续借操作
        const borrowResult = await client.query(
          `UPDATE borrow_records 
           SET due_date = due_date + INTERVAL '14 days',
               renewed_times = renewed_times + 1
           WHERE id = $1 AND status = 'borrowed' AND renewed_times < 2
           RETURNING *`,
          [params.id]
        );
        
        if (borrowResult.rows.length === 0) {
          throw new Error('借阅记录不存在或不可续借');
        }
      }
      
      await client.query('COMMIT');
      return NextResponse.json({ success: true });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('更新借阅记录失败:', error);
    return NextResponse.json(
      { error: error.message || '更新借阅记录失败' },
      { status: 500 }
    );
  }
} 