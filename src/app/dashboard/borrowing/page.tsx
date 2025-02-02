'use client';

import React, { useState, useEffect } from 'react';

import { Table, Button, Space, Tag,  Tabs } from 'antd';

import { borrowApi, bookApi } from '@/services/api';
import { BorrowRecord, Book } from '@/types';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useRouter } from 'next/navigation';
import { showNotification } from '@/components/Common/Notification';

const { TabPane } = Tabs;

 
export default function BorrowingPage() {
  const router = useRouter();
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  const [userRole, setUserRole] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const id = localStorage.getItem('userId');
    const role = localStorage.getItem('userRole');

    if (!token || !id) {
      showNotification('error', '请先登录');
      router.push('/login');
      return;
    }

    setUserRole(role || '');
    setUserId(id);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recordsData, booksData] = await Promise.all([
        userRole === 'admin' 
          ? borrowApi.getBorrowRecords()
          : borrowApi.getBorrowRecords(userId),
        bookApi.getBooks(),
      ]);

      setRecords(recordsData);
      setAvailableBooks(booksData.filter(book => book.stock > 0));
    } catch (error) {
      showNotification('error', '获取数据失败');
      console.error('获取借阅记录失败:', error);
    } finally {
      setLoading(false);
    }
  };
 
  const handleBorrow = async (bookId: string) => {
    if (!userId) {
      showNotification('error', '请先登录');
      router.push('/login');
      return;
    }

    try {
      await borrowApi.borrowBook(bookId, userId);
      showNotification('success', '借阅成功');
      fetchData();
    } catch (error: any) {
      showNotification('error', error.message || '借阅失败');
    }
  };

  const checkPermission = (record: any) => {
    if (userRole === 'admin') return true;
    if (record.user_id.toString() === userId) return true;
    showNotification('error', '您没有权限执行此操作');
    return false;
  };


  const handleReturn = async (record: BorrowRecord) => {
    if (!checkPermission(record)) return;
    
    try {
      await borrowApi.returnBook(record.id);
      showNotification('success', '还书成功');

      fetchData();

    } catch (error) {
      showNotification('error', '还书失败');
    }
  };

  const handleRenew = async (record: BorrowRecord) => {

    if (!checkPermission(record)) return;
    
    try {
      const updatedRecord = await borrowApi.renewBook(record.id);
      showNotification('success', '续借成功，应还时间已延长14天');
      fetchData();
    } catch (error) {
      showNotification('error', '续借失败');
    }

  };

  const borrowedBooksColumns = [
    {
      title: '图书',
      dataIndex: 'book_title',
      key: 'book_title',
      render: (text: string) => text || '未知书名',
    },
    {
      title: '作者',
      dataIndex: 'book_author',
      key: 'book_author',
      render: (text: string) => text || '未知作者',

    },
    {
      title: '借阅时间',
      dataIndex: 'borrow_date',
      key: 'borrow_date',
      render: (date: string) => {
        if (!date) return '未知日期';
        try {
          return new Date(date).toLocaleDateString('zh-CN');
        } catch {
          return '日期格式错误';
        }
      },

    },
    {
      title: '应还时间',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date: string) => {
        if (!date) return '未知日期';
        try {
          return new Date(date).toLocaleDateString('zh-CN');
        } catch {
          return '日期格式错误';
        }
      },

    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={
          status === 'borrowed' ? 'blue' :
          status === 'returned' ? 'green' : 'red'
        }>
          {status === 'borrowed' ? '借阅中' :
           status === 'returned' ? '已归还' : '已逾期'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => {
        const canOperate = userRole === 'admin' || record.user_id.toString() === userId;
        
        return (
          <Space>
            {record.status === 'borrowed' && canOperate && (
              <>
                <Button onClick={() => handleReturn(record)}>
                  还书
                </Button>
                <Button onClick={() => handleRenew(record)}>
                  续借
                </Button>
              </>
            )}
            {record.status === 'borrowed' && !canOperate && (
              <Tag color="warning">无操作权限</Tag>
            )}
          </Space>
        );
      },
    },
    ...(userRole === 'admin' ? [{
      title: '借阅人',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => text || '未知用户',
    }] : []),
  ];

  const availableBooksColumns = [
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
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, book: Book) => (
        <Button 
          type="primary"
          onClick={() => handleBorrow(book.id)}
          disabled={book.stock <= 0}
        >
          借阅
        </Button>

      ),
    },
  ];

  return (
    <DashboardLayout>
      <Tabs defaultActiveKey="borrowed">
        <TabPane tab="已借阅图书" key="borrowed">
          <Table
            columns={borrowedBooksColumns}
            dataSource={records}
            rowKey="id"
            loading={loading}
          />
        </TabPane>
        <TabPane tab="可借阅图书" key="available">
          <Table
            columns={availableBooksColumns}
            dataSource={availableBooks}
            rowKey="id"
            loading={loading}
          />
        </TabPane>
      </Tabs>
    </DashboardLayout>
  );
} 