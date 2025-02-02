import { Book, User, BorrowRecord } from '../types';

export const books: Book[] = [
  {
    id: '1',
    title: '三体',
    author: '刘慈欣',
    isbn: '9787536692930',
    publisher: '重庆出版社',
    publish_date: '2008-01-01',
    category: '科幻',
    description: '地球文明面临外星文明的威胁...',
    stock: 5
  },
  // 可以添加更多示例数据
];

export const users: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: '2024-01-01'
  },
  // 可以添加更多示例数据
];

export const borrowRecords: BorrowRecord[] = [
  {
    id: '1',
    bookId: '1',
    userId: '1',
    borrowDate: '2024-03-01',
    dueDate: '2024-03-15',
    status: 'borrowed'
  },
  // 可以添加更多示例数据
];