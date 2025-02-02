'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Spin } from 'antd';
import { BookOutlined, UserOutlined, SwapOutlined } from '@ant-design/icons';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { showNotification } from '@/components/Common/Notification';

interface BookStats {
  bookId: string;
  title: string;
  borrowCount: number;
}

interface Statistics {
  totalBooks: number;
  totalUsers: number;
  activeLoans: number;
  popularBooks: BookStats[];
}

export default function StatisticsPage() {
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<Statistics>({
    totalBooks: 0,
    totalUsers: 0,
    activeLoans: 0,
    popularBooks: []
  });

  const fetchStatistics = async () => {
    setLoading(true);
    try {

      const response = await fetch('/api/statistics');
      if (!response.ok) {
        throw new Error('获取统计数据失败');
      }
      const data = await response.json();
      setStatistics(data);

    } catch (error) {
      console.error('获取统计数据失败:', error);
      showNotification('error', '获取统计数据失败');
    } finally {
      setLoading(false);
    }
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
      sorter: (a: BookStats, b: BookStats) => b.borrowCount - a.borrowCount,
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总图书数"
              value={statistics.totalBooks}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="注册用户数"
              value={statistics.totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="当前借阅数"
              value={statistics.activeLoans}
              prefix={<SwapOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="热门图书排行" style={{ marginTop: 16 }}>
        <Table
          columns={popularBooksColumns}
          dataSource={statistics.popularBooks}
          rowKey="bookId"
          pagination={false}
        />
      </Card>
    </DashboardLayout>
  );
} 