'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table } from 'antd';
import { BookOutlined, UserOutlined, SwapOutlined } from '@ant-design/icons';
import { borrowApi, bookApi, userApi } from '@/services/api';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Book, BorrowRecord } from '@/types';

interface BookStats {
  bookId: string;
  title: string;
  borrowCount: number;
}

export default function StatisticsPage() {
  const [loading, setLoading] = useState(false);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeLoans, setActiveLoans] = useState(0);
  const [popularBooks, setPopularBooks] = useState<BookStats[]>([]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      // 获取所有借阅记录
      const response = await fetch('/api/statistics/borrow-counts');
      const data = await response.json();
      
      setPopularBooks(data.popularBooks);
      setTotalBooks(data.totalBooks);
      setTotalUsers(data.totalUsers);
      setActiveLoans(data.activeLoans);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePopularBooks = (books: Book[], records: BorrowRecord[]): BookStats[] => {
    const borrowCounts = records.reduce((acc, record) => {
      acc[record.bookId] = (acc[record.bookId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return books
      .map(book => ({
        bookId: book.id,
        title: book.title,
        borrowCount: borrowCounts[book.id] || 0,
      }))
      .sort((a, b) => b.borrowCount - a.borrowCount)
      .slice(0, 5);
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const popularBooksColumns = [
    {
      title: '图书名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '借阅次数',
      dataIndex: 'borrowCount',
      key: 'borrowCount',
    },
  ];

  return (
    <DashboardLayout>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总图书数"
              value={totalBooks}
              prefix={<BookOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="注册用户数"
              value={totalUsers}
              prefix={<UserOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="当前借阅数"
              value={activeLoans}
              prefix={<SwapOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Card title="热门图书排行" style={{ marginTop: 16 }}>
        <Table
          columns={popularBooksColumns}
          dataSource={popularBooks}
          rowKey="bookId"
          loading={loading}
          pagination={false}
        />
      </Card>
    </DashboardLayout>
  );
} 