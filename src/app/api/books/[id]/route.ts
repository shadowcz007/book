import { pool } from '@/db/config';
import { NextRequest, NextResponse } from 'next/server';

// 更新图书
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, author, isbn, publisher, publish_date, category, description, stock } = body;
    
    const result = await pool.query(
      `UPDATE books 
       SET title = $1, author = $2, isbn = $3, publisher = $4, 
           publish_date = $5, category = $6, description = $7, stock = $8
       WHERE id = $9
       RETURNING *`,
      [title, author, isbn, publisher, publish_date, category, description, stock, params.id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '图书不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('更新图书失败:', error);
    return NextResponse.json(
      { error: '更新图书失败' },
      { status: 500 }
    );
  }
}

// 删除图书
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await pool.query(
      'DELETE FROM books WHERE id = $1 RETURNING id',
      [params.id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '图书不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除图书失败:', error);
    return NextResponse.json(
      { error: '删除图书失败' },
      { status: 500 }
    );
  }
} 