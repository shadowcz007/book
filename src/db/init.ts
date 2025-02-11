import { Pool } from 'pg';

export const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'book_management',
  password: '1215',
  port: 5432,
});

export async function initDatabase() {
  const client = await pool.connect();
  try {
    // 创建用户表
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- 创建管理员账号（如果不存在）
      INSERT INTO users (username, email, password, role)
      VALUES ('admin', 'admin@example.com', 'admin123', 'admin')
      ON CONFLICT (username) DO NOTHING;
    `);

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

    // 创建借阅记录表
    await client.query(`
      CREATE TABLE IF NOT EXISTS borrow_records (
        id SERIAL PRIMARY KEY,
        book_id INTEGER REFERENCES books(id),
        user_id INTEGER REFERENCES users(id),
        borrow_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        due_date TIMESTAMP WITH TIME ZONE NOT NULL,
        return_date TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20) NOT NULL DEFAULT 'borrowed',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- 为 borrow_records 表添加更新时间触发器
      DROP TRIGGER IF EXISTS update_borrow_records_updated_at ON borrow_records;
      CREATE TRIGGER update_borrow_records_updated_at
        BEFORE UPDATE ON borrow_records
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('数据库初始化成功');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  } finally {
    client.release();
  }
} 