'use client';

import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  BookOutlined,
  UserOutlined,
  SwapOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Header, Sider, Content } = Layout;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  const menuItems = [
    {
      key: 'books',
      icon: <BookOutlined />,
      label: '图书管理',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: 'borrowing',
      icon: <SwapOutlined />,
      label: '借阅管理',
    },
    {
      key: 'statistics',
      icon: <BarChartOutlined />,
      label: '数据统计',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['books']}
          items={menuItems}
          onClick={({ key }) => router.push(`/dashboard/${key}`)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff' }} />
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, minHeight: 360, background: '#fff' }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}