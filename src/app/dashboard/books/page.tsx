'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Modal, message, Popconfirm } from 'antd';
import { bookApi, borrowApi } from '@/services/api';
import { Book } from '@/types';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import BookForm from '@/components/Books/BookForm';

const { Search } = Input;

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  const [userId, setUserId] = useState<string | null>(null);

  const fetchBooks = async (search?: string) => {
    setLoading(true);
    try {
      let data;
      if (search) {
        data = await bookApi.searchBooks(search);
      } else {
        data = await bookApi.getBooks();
      }
      setBooks(data);
    } catch (error: any) {
      console.error('获取图书列表失败:', error);
      message.error('获取图书列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    const role = localStorage.getItem('userRole') as 'admin' | 'user';
    const uid = localStorage.getItem('userId');
    setUserRole(role || 'user');
    setUserId(uid);
  }, []);

  const handleAdd = async (values: Partial<Book>) => {
    try {
      await bookApi.addBook(values as Omit<Book, 'id'>);
      message.success('添加图书成功');
      setIsModalOpen(false);
      fetchBooks();
    } catch (error: any) {
      console.error('添加图书失败:', error);
      message.error('添加图书失败');
    }
  };

  const handleEdit = async (values: Partial<Book>) => {
    if (!editingBook) return;
    try {
      await bookApi.updateBook(editingBook.id, {
        ...values,
        id: editingBook.id  // 确保保留原书的 ID
      });
      message.success('更新图书成功');
      setIsModalOpen(false);
      setEditingBook(null);
      fetchBooks();
    } catch (error: any) {
      console.error('更新图书失败:', error);
      message.error('更新图书失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await bookApi.deleteBook(id);
      message.success('删除图书成功');
      await fetchBooks();
    } catch (error: any) {
      console.error('删除图书失败:', error);
      message.error('删除图书失败');
    }
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchText.toLowerCase()) ||
    book.author.toLowerCase().includes(searchText.toLowerCase()) ||
    book.isbn.includes(searchText)
  );

  const columns = [
    {
      title: '书名',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
    },
    {
      title: '出版社',
      dataIndex: 'publisher',
      key: 'publisher',
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Book) => (
        <Space size="middle">
          {userRole === 'user' && record.stock > 0 && (
            <Button
              type="primary"
              onClick={() => {
                Modal.confirm({
                  title: '确认借阅',
                  content: `确定要借阅《${record.title}》吗？`,
                  onOk: async () => {
                    try {
                      await borrowApi.borrowBook(record.id, userId||'');
                      message.success('借阅成功');
                      fetchBooks();
                    } catch (error: any) {
                      console.error('借阅失败:', error);
                      message.error('借阅失败');
                    }
                  },
                });
              }}
            >
              借阅
            </Button>
          )}
          <Button 
            type="link" 
            onClick={() => {
              setEditingBook(record);
              setIsModalOpen(true);
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="删除确认"
            description={`确定要删除《${record.title}》吗？`}
            onConfirm={async () => {
              try {
                await handleDelete(record.id);
              } catch (error: any) {
                console.error('删除失败:', error);
              }
            }}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space>
          <Button 
            type="primary"
            onClick={() => {
              setEditingBook(null);
              setIsModalOpen(true);
            }}
          >
            添加图书
          </Button>
          <Search
            placeholder="搜索图书"
            allowClear
            onSearch={value => {
              setSearchText(value);
              fetchBooks(value);
            }}
            style={{ width: 300 }}
          />
        </Space>
        <Table 
          columns={columns} 
          dataSource={filteredBooks} 
          rowKey={(record) => `book-${record.id}`}
          loading={loading}
        />
      </Space>

      <BookForm
        key={editingBook ? `edit-${editingBook.id}` : 'new'+(new Date().getTime())}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingBook(null);
        }}
        onSubmit={editingBook ? handleEdit : handleAdd}
        initialValues={editingBook || undefined}
        title={editingBook ? '编辑图书' : '添加图书'}
      />
    </DashboardLayout>
  );
}