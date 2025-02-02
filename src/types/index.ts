export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  publishDate: string;
  category: string;
  description: string;
  stock: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  userId: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue';
}