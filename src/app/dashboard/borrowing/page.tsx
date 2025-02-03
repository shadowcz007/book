'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Modal } from 'antd';
import { borrowApi, bookApi } from '@/services/api';
import { BorrowRecord, Book } from '@/types';
import DashboardLayout from '@/components/Layout/DashboardLayout';

export default function BorrowingPage() {
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recordsData, booksData] = await Promise.all([
        borrowApi.getBorrowRecords(),
        bookApi.getBooks(),
      ]);
      setRecords(recordsData);
      setBooks(booksData);
    } catch (error) {
      // message.error('获取借阅记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReturn = async (record: BorrowRecord) => {
    try {
      await borrowApi.returnBook(record.id);
      // message.success('还书成功');
      fetchData();
    } catch (error) {
      // message.error('还书失败');
    }
  };

  const getBookTitle = (bookId: string) => {
    return books.find(book => book.id === bookId)?.title || '未知图书';
  };

  const getStatusTag = (status: BorrowRecord['status']) => {
    const statusMap = {
      borrowed: { color: 'blue', text: '借阅中' },
      returned: { color: 'green', text: '已归还' },
      overdue: { color: 'red', text: '已逾期' },
    };
    const { color, text } = statusMap[status];
    return <Tag color={color}>{text}</Tag>;
  };

  const columns = [
    {
      title: '图书',
      dataIndex: 'bookId',
      key: 'bookId',
      render: (bookId: string) => getBookTitle(bookId),
    },
    {
      title: '借阅时间',
      dataIndex: 'borrowDate',
      key: 'borrowDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '应还时间',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: BorrowRecord['status']) => getStatusTag(status),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: BorrowRecord) => (
        <Space size="middle">
          {record.status === 'borrowed' && (
            <Button 
              type="primary"
              onClick={() => {
                Modal.confirm({
                  title: '确认还书',
                  content: '确定要归还这本书吗？',
                  onOk: () => handleReturn(record),
                });
              }}
            >
              还书
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Table 
        columns={columns} 
        dataSource={records} 
        rowKey="id" 
        loading={loading}
      />
    </DashboardLayout>
  );
} 