'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import {
  BookOutlined,
  UserOutlined,
  SwapOutlined,
  BarChartOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Header, Sider, Content } = Layout;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  const router = useRouter();

  useEffect(() => {
    // 从 localStorage 或 session 中获取用户角色
    const role = localStorage.getItem('userRole') as 'admin' | 'user';
    setUserRole(role || 'user');
  }, []);

  const adminMenuItems = [
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

  const userMenuItems = [
    {
      key: 'borrowing',
      icon: <SwapOutlined />,
      label: '我的借阅',
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    router.push('/login');
  };

  const menuItems = [
    ...(userRole === 'admin' ? adminMenuItems : userMenuItems),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['borrowing']}
          items={menuItems}
          onClick={({ key }) => {
            if (key === 'logout') {
              handleLogout();
            } else {
              router.push(`/dashboard/${key}`);
            }
          }}
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