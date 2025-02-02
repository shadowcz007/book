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
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error('获取用户列表失败');
    }
    return response.json();
  },

  login: async (username: string, password: string): Promise<User> => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      throw new Error('用户名或密码错误');
    }
    return response.json();
  },

  register: async (user: { username: string; email: string; password: string }): Promise<User> => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      throw new Error('注册失败');
    }
    return response.json();
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error('更新用户失败');
    }
    return response.json();
  },

  deleteUser: async (id: string): Promise<void> => {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('删除用户失败');
    }
  },
};

// 借阅相关 API
export const borrowApi = {
  getBorrowRecords: async (userId?: string): Promise<BorrowRecord[]> => {
    const url = userId ? `/api/borrow-records?userId=${userId}` : '/api/borrow-records';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('获取借阅记录失败');
    }
    return response.json();
  },

  borrowBook: async (bookId: string, userId: string): Promise<BorrowRecord> => {
    const response = await fetch('/api/borrow-records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bookId, userId }),
    });
    if (!response.ok) {
      throw new Error('借阅失败');
    }
    return response.json();
  },

  returnBook: async (recordId: string): Promise<void> => {
    const response = await fetch(`/api/borrow-records/${recordId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'return' }),
    });
    if (!response.ok) {
      throw new Error('还书失败');
    }
  },

  renewBook: async (recordId: string): Promise<void> => {
    const response = await fetch(`/api/borrow-records/${recordId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'renew' }),
    });
    if (!response.ok) {
      throw new Error('续借失败');
    }
  },
}; 