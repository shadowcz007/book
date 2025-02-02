import { pool } from '@/db/config';
import { NextResponse } from 'next/server';

export async function GET() {
  const client = await pool.connect();
  try {
    // 创建图书表
    await client.query(`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        isbn VARCHAR(20) UNIQUE NOT NULL,
        publisher VARCHAR(255) NOT NULL,
        publish_date DATE NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        stock INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- 创建更新时间触发器
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- 为 books 表添加触发器
      DROP TRIGGER IF EXISTS update_books_updated_at ON books;
      CREATE TRIGGER update_books_updated_at
        BEFORE UPDATE ON books
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    return NextResponse.json({ message: '数据库初始化成功' });
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return NextResponse.json(
      { error: '数据库初始化失败' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
} 