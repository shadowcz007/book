import { Book, User, BorrowRecord } from '@/types';
import { books, users, borrowRecords } from '@/mock/data';
import { booksDb, BookCreate, BookUpdate } from '@/db/books';

// 图书相关 API
export const bookApi = {
  getBooks: async (): Promise<Book[]> => {
    const response = await fetch('/api/books');
    if (!response.ok) {
      throw new Error('获取图书列表失败');
    }
    return response.json();
  },

  addBook: async (book: Omit<Book, 'id'>): Promise<Book> => {
    const response = await fetch('/api/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(book),
    });
    if (!response.ok) {
      throw new Error('添加图书失败');
    }
    return response.json();
  },

  updateBook: async (id: string, book: Partial<Book>): Promise<Book> => {
    const response = await fetch(`/api/books/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(book),
    });
    if (!response.ok) {
      throw new Error('更新图书失败');
    }
    return response.json();
  },

  deleteBook: async (id: string): Promise<void> => {
    const response = await fetch(`/api/books/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('删除图书失败');
    }
  },

  searchBooks: async (query: string): Promise<Book[]> => {
    const response = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('搜索图书失败');
    }
    return response.json();
  },
};

// 用户相关 API
export const userApi = {
  getUsers: async (): Promise<User[]> => {
    return Promise.resolve(users);
  },

  login: async (username: string, password: string): Promise<User> => {
    const user = users.find(u => u.username === username);
    if (!user) {
      return Promise.reject(new Error('用户不存在'));
    }
    // 实际应用中应该进行密码验证
    return Promise.resolve(user);
  },

  register: async (user: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    const newUser = {
      ...user,
      id: String(users.length + 1),
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    return Promise.resolve(newUser);
  },
};

// 借阅相关 API
export const borrowApi = {
  getBorrowRecords: async (): Promise<BorrowRecord[]> => {
    return Promise.resolve(borrowRecords);
  },

  borrowBook: async (bookId: string, userId: string): Promise<BorrowRecord> => {
    const book = books.find(b => b.id === bookId);
    if (!book) {
      return Promise.reject(new Error('图书不存在'));
    }
    if (book.stock <= 0) {
      return Promise.reject(new Error('图书库存不足'));
    }

    const newRecord: BorrowRecord = {
      id: String(borrowRecords.length + 1),
      bookId,
      userId,
      borrowDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'borrowed',
    };

    borrowRecords.push(newRecord);
    book.stock -= 1;
    return Promise.resolve(newRecord);
  },

  returnBook: async (recordId: string): Promise<BorrowRecord> => {
    const record = borrowRecords.find(r => r.id === recordId);
    if (!record) {
      return Promise.reject(new Error('借阅记录不存在'));
    }

    record.status = 'returned';
    record.returnDate = new Date().toISOString();

    const book = books.find(b => b.id === record.bookId);
    if (book) {
      book.stock += 1;
    }

    return Promise.resolve(record);
  },
}; 