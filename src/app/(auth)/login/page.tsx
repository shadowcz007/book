'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userApi } from '@/services/api';
import Notification from '@/components/Notification';

interface LoginForm {
  username: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    visible: boolean;
  } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message, visible: true });
    setTimeout(() => setNotification(null), 3000);
  };

  const onFinish = async (values: LoginForm) => {
    try {
      const user = await userApi.login(values.username, values.password);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userRole', user.role);
      showNotification('success', '登录成功');
      setTimeout(() => {
        router.push(user.role === 'admin' ? '/dashboard/books' : '/dashboard/borrowing');
      }, 1000);
    } catch (error) {
      showNotification('error', '用户名或密码错误');
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: '#f0f2f5' 
    }}>
      <Notification {...notification} />
      <Card title="图书管理系统登录" style={{ width: 400 }}>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名！' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码！' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              登录
            </Button>
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              还没有账号？ <Link href="/register">立即注册</Link>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
} 