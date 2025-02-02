import { Pool, PoolConfig } from 'pg';

const dbConfig: PoolConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'book_management',
  password: process.env.DB_PASSWORD || '1215',
  port: Number(process.env.DB_PORT) || 5432,
  ssl: {
    rejectUnauthorized: false
  }
};

export const pool = new Pool(dbConfig); 