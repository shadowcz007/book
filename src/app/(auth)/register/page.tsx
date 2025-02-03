'use client';

import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const onFinish = (values: RegisterForm) => {
    // 这里应该调用真实的注册 API
    // message.success('注册成功');
    router.push('/login');
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: '#f0f2f5' 
    }}>
      <Card title="注册新用户" style={{ width: 400 }}>
        <Form
          name="register"
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名！' }]}
          >
            <Input placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱！' },
              { type: 'email', message: '请输入有效的邮箱地址！' }
            ]}
          >
            <Input placeholder="邮箱" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码！' }]}
          >
            <Input.Password placeholder="密码" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码！' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致！'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="确认密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              注册
            </Button>
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              已有账号？ <Link href="/login">返回登录</Link>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
} 