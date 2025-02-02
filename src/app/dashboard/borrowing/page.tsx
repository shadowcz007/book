'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Modal, Tabs, Input } from 'antd';
import { borrowApi, bookApi } from '@/services/api';
import { BorrowRecord, Book } from '@/types';
import DashboardLayout from '@/components/Layout/DashboardLayout';

const { Search } = Input;

export default function BorrowingPage() {
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [booksLoading, setBooksLoading] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  const [userId, setUserId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    visible: boolean;
  } | null>(null);
  const [borrowModalVisible, setBorrowModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [renewModalVisible, setRenewModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BorrowRecord | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message, visible: true });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const role = localStorage.getItem('userRole') as 'admin' | 'user';
    const uid = localStorage.getItem('userId');
    setUserRole(role || 'user');
    setUserId(uid);
    
    // 添加日志以便调试
    console.log('用户ID:', uid);
    console.log('用户角色:', role);
    
    // 只有在获取到用户ID后才获取记录
    if (uid) {
      fetchAvailableBooks();
      fetchRecords(); // 这里会使用最新的用户角色和ID
    } else {
      showNotification('error', '请先登录');
    }
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      // 获取最新的用户角色和ID
      const currentRole = localStorage.getItem('userRole') as 'admin' | 'user';
      const currentUserId = localStorage.getItem('userId');
      
      // 只有管理员可以查看所有记录，普通用户只能查看自己的记录
      const data = await borrowApi.getBorrowRecords(
        currentRole === 'admin' ? undefined : currentUserId
      );
      setRecords(data);
    } catch (error) {
      showNotification('error', '获取借阅记录失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableBooks = async (search?: string) => {
    setBooksLoading(true);
    console.log('fetchAvailableBooks');
    try {
      let data;
      if (search) {
        data = await bookApi.searchBooks(search);
      } else {
        data = await bookApi.getBooks();
      }
      setAvailableBooks(data);
    } catch (error) {
      showNotification('error', '获取图书列表失败');
    } finally {
      setBooksLoading(false);
    }
  };

  const handleReturn = async (record: BorrowRecord) => {
    try {
      await borrowApi.returnBook(record.id);
      showNotification('success', '还书成功');
      await Promise.all([
        fetchAvailableBooks(),
        fetchRecords()
      ]);
      setReturnModalVisible(false);
      setSelectedRecord(null);
    } catch (error) {
      showNotification('error', '还书失败');
    }
  };

  const handleRenew = async (record: BorrowRecord) => {
    try {
      await borrowApi.renewBook(record.id);
      showNotification('success', '续借成功');
      await Promise.all([
        fetchAvailableBooks(),
        fetchRecords()
      ]);
      setRenewModalVisible(false);
      setSelectedRecord(null);
    } catch (error) {
      showNotification('error', '续借失败');
    }
  };

  const handleBorrow = async (book: Book) => {
    // 再次检查用户ID
    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) {
      showNotification('error', '请先登录');
      // 可以添加重定向逻辑
      // window.location.href = '/login';
      return;
    }
    
    try {
      setLoading(true);
      await borrowApi.borrowBook(book.id, currentUserId); // 使用当前获取的用户ID
      showNotification('success', '借阅成功');
      await Promise.all([
        fetchAvailableBooks(),
        fetchRecords()
      ]);
      setBorrowModalVisible(false);
      setSelectedBook(null);
    } catch (error: any) {
      showNotification('error', error.message || '借阅失败');
      console.error('借阅失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '图书',
      dataIndex: 'book_title',
      key: 'book_title',
    },
    userRole === 'admin' && {
      title: '借阅人',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '借阅时间',
      dataIndex: 'borrow_date',
      key: 'borrow_date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '应还时间',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          borrowed: { color: 'blue', text: '借阅中' },
          returned: { color: 'green', text: '已归还' },
          overdue: { color: 'red', text: '已逾期' },
        };
        const { color, text } = statusMap[status as keyof typeof statusMap];
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '续借次数',
      dataIndex: 'renewed_times',
      key: 'renewed_times',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: BorrowRecord) => (
        <Space size="middle">
          {record.status === 'borrowed' && (
            <>
              <Button
                type="primary"
                onClick={() => {
                  setSelectedRecord(record);
                  setReturnModalVisible(true);
                }}
              >
                还书
              </Button>
              {record.renewed_times < 2 && (
                <Button
                  onClick={() => {
                    setSelectedRecord(record);
                    setRenewModalVisible(true);
                  }}
                >
                  续借
                </Button>
              )}
            </>
          )}
        </Space>
      ),
    },
  ].filter(Boolean);

  const availableBooksColumns = [
    {
      title: '书名',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <a>{text}</a>,
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
      title: '出版日期',
      dataIndex: 'publish_date',
      key: 'publish_date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number) => (
        <Tag color={stock > 0 ? 'green' : 'red'}>
          {stock > 0 ? `可借 ${stock}` : '已借完'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Book) => (
        <Space size="middle">
          {record.stock > 0 && (
            <Button
              type="primary"
              onClick={() => {
                setSelectedBook(record);
                setBorrowModalVisible(true);
              }}
            >
              借阅
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout>
      {notification && notification.visible && (
        <div
          style={{
            padding: '8px 16px',
            marginBottom: '16px',
            borderRadius: '4px',
            backgroundColor: notification.type === 'success' ? '#f6ffed' : '#fff2f0',
            border: `1px solid ${notification.type === 'success' ? '#b7eb8f' : '#ffccc7'}`,
            color: notification.type === 'success' ? '#52c41a' : '#ff4d4f',
          }}
        >
          {notification.message}
        </div>
      )}
      
      <Tabs
        defaultActiveKey="available"
        items={[
          {
            key: 'available',
            label: '可借阅图书',
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Space>
                  <Search
                    placeholder="搜索图书"
                    allowClear
                    onSearch={value => {
                      setSearchText(value);
                      fetchAvailableBooks(value);
                    }}
                    style={{ width: 300 }}
                  />
                </Space>
                <Table
                  columns={availableBooksColumns}
                  dataSource={availableBooks}
                  rowKey="id"
                  loading={booksLoading}
                />
              </Space>
            ),
          },
          {
            key: 'records',
            label: '借阅记录',
            children: (
              <Table
                columns={columns}
                dataSource={records}
                rowKey="id"
                loading={loading}
              />
            ),
          },
        ]}
      />

      <Modal
        title="确认还书"
        open={returnModalVisible}
        onOk={() => selectedRecord && handleReturn(selectedRecord)}
        onCancel={() => {
          setReturnModalVisible(false);
          setSelectedRecord(null);
        }}
        okText="确认"
        cancelText="取消"
      >
        {selectedRecord && (
          <p>确定要归还《{selectedRecord.book_title}》吗？</p>
        )}
      </Modal>

      <Modal
        title="确认续借"
        open={renewModalVisible}
        onOk={() => selectedRecord && handleRenew(selectedRecord)}
        onCancel={() => {
          setRenewModalVisible(false);
          setSelectedRecord(null);
        }}
        okText="确认"
        cancelText="取消"
      >
        {selectedRecord && (
          <p>确定要续借《{selectedRecord.book_title}》吗？</p>
        )}
      </Modal>

      <Modal
        title="确认借阅"
        open={borrowModalVisible}
        onOk={() => selectedBook && handleBorrow(selectedBook)}
        onCancel={() => {
          setBorrowModalVisible(false);
          setSelectedBook(null);
        }}
        okText="确认"
        cancelText="取消"
      >
        {selectedBook && (
          <p>确定要借阅《{selectedBook.title}》吗？</p>
        )}
      </Modal>
    </DashboardLayout>
  );
} 