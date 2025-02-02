import { pool } from '@/db/config';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function GET() {
  const client = await pool.connect();
  try {
    // 删除现有的触发器和函数（如果存在）
    await client.query(`
      DROP TRIGGER IF EXISTS update_books_updated_at ON books;
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      DROP FUNCTION IF EXISTS update_updated_at_column();
      
      -- 删除现有的表（如果存在）
      DROP TABLE IF EXISTS books;
      DROP TABLE IF EXISTS users;

      -- 创建更新时间触发器函数
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- 创建表
      CREATE TABLE books (
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

      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- 创建触发器
      CREATE TRIGGER update_books_updated_at
        BEFORE UPDATE ON books
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // 为管理员账号创建加密密码
    const hashedPassword = await bcrypt.hash('admin', 10);

    // 创建管理员账号（如果不存在）
    await client.query(`
      INSERT INTO users (username, email, password, role)
      VALUES ('admin', 'admin@example.com', $1, 'admin')
      ON CONFLICT (username) DO UPDATE 
      SET password = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE users.username = 'admin'
    `, [hashedPassword]);

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