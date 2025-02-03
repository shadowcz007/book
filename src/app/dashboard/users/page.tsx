'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, message } from 'antd';
import { userApi } from '@/services/api';
import { User } from '@/types';
import DashboardLayout from '@/components/Layout/DashboardLayout';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userApi.getUsers();
      setUsers(data);
    } catch (error) {
      // message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? '管理员' : '普通用户'}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button 
            type="link" 
            danger
            onClick={() => {
              Modal.confirm({
                title: '确认删除',
                content: `确定要删除用户 ${record.username} 吗？`,
                onOk: () => {
                  // message.success('删除成功')
                },
              });
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Table 
        columns={columns} 
        dataSource={users} 
        rowKey="id" 
        loading={loading}
      />
    </DashboardLayout>
  );
} 