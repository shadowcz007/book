import { pool } from './init';
import { Book } from '@/types';

export interface BookCreate extends Omit<Book, 'id'> {}
export interface BookUpdate extends Partial<BookCreate> {}

export const booksDb = {
  async findAll(): Promise<Book[]> {
    const result = await pool.query(
      'SELECT * FROM books ORDER BY created_at DESC'
    );
    return result.rows;
  },

  async findById(id: string): Promise<Book | null> {
    const result = await pool.query(
      'SELECT * FROM books WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async create(book: BookCreate): Promise<Book> {
    const result = await pool.query(
      `INSERT INTO books (
        title, author, isbn, publisher, publish_date, 
        category, description, stock
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [
        book.title,
        book.author,
        book.isbn,
        book.publisher,
        book.publish_date,
        book.category,
        book.description,
        book.stock
      ]
    );
    return result.rows[0];
  },

  async update(id: string, book: BookUpdate): Promise<Book | null> {
    const setClause = Object.keys(book)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = Object.values(book);
    
    const result = await pool.query(
      `UPDATE books 
       SET ${setClause}
       WHERE id = $1
       RETURNING *`,
      [id, ...values]
    );
    
    return result.rows[0] || null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM books WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rowCount > 0;
  },

  async search(query: string): Promise<Book[]> {
    const result = await pool.query(
      `SELECT * FROM books 
       WHERE title ILIKE $1 
       OR author ILIKE $1 
       OR isbn ILIKE $1`,
      [`%${query}%`]
    );
    return result.rows;
  }
}; 