import { pool } from '@/db/config';
import { NextRequest, NextResponse } from 'next/server';

// 还书
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await pool.connect();
  try {
    const { action } = await request.json();
    await client.query('BEGIN');

    if (action === 'return') {
      // 处理还书
      const borrowRecord = await client.query(
        'SELECT * FROM borrow_records WHERE id = $1',
        [params.id]
      );

      if (borrowRecord.rows.length === 0) {
        return NextResponse.json(
          { error: '借阅记录不存在' },
          { status: 404 }
        );
      }

      // 更新借阅记录
      const result = await client.query(
        `UPDATE borrow_records 
         SET status = 'returned', return_date = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [params.id]
      );

      // 更新图书库存
      await client.query(
        'UPDATE books SET stock = stock + 1 WHERE id = $1',
        [borrowRecord.rows[0].book_id]
      );

      await client.query('COMMIT');
      return NextResponse.json(result.rows[0]);
    } else if (action === 'renew') {
      // 处理续借
      const borrowRecord = await client.query(
        'SELECT * FROM borrow_records WHERE id = $1',
        [params.id]
      );

      if (borrowRecord.rows.length === 0) {
        return NextResponse.json(
          { error: '借阅记录不存在' },
          { status: 404 }
        );
      }

      if (borrowRecord.rows[0].status !== 'borrowed') {
        return NextResponse.json(
          { error: '只能续借未归还的图书' },
          { status: 400 }
        );
      }

      // 延长借阅期限14天
      const newDueDate = new Date();
      newDueDate.setDate(newDueDate.getDate() + 14);

      const result = await client.query(
        `UPDATE borrow_records 
         SET due_date = $1
         WHERE id = $2
         RETURNING *`,
        [newDueDate, params.id]
      );

      await client.query('COMMIT');
      return NextResponse.json(result.rows[0]);
    }

    return NextResponse.json(
      { error: '无效的操作' },
      { status: 400 }
    );
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('更新借阅记录失败:', error);
    return NextResponse.json(
      { error: '更新借阅记录失败' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
} 