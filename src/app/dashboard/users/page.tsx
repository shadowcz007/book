'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, message, Select } from 'antd';
import { userApi } from '@/services/api';
import { User } from '@/types';
import DashboardLayout from '@/components/Layout/DashboardLayout';

const { Option } = Select;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    visible: boolean;
  } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message, visible: true });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userApi.getUsers();
      setUsers(data);
    } catch (error) {
      showNotification('error', '获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditUser = async (role: 'admin' | 'user') => {
    if (!editingUser) return;
    try {
      await userApi.updateUser(editingUser.id, { role });
      showNotification('success', '更新用户角色成功');
      setEditModalVisible(false);
      fetchUsers();
    } catch (error) {
      showNotification('error', '更新用户角色失败');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await userApi.deleteUser(id);
      showNotification('success', '删除用户成功');
      fetchUsers();
    } catch (error) {
      showNotification('error', '删除用户失败');
    }
  };

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
            onClick={() => {
              setEditingUser(record);
              setEditModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            onClick={() => {
              Modal.confirm({
                title: '确认删除',
                content: `确定要删除用户 ${record.username} 吗？`,
                onOk: () => handleDeleteUser(record.id),
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
      
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title="编辑用户角色"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingUser(null);
        }}
        footer={null}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>当前用户：{editingUser?.username}</div>
          <Select
            style={{ width: '100%' }}
            defaultValue={editingUser?.role}
            onChange={handleEditUser}
          >
            <Option value="user">普通用户</Option>
            <Option value="admin">管理员</Option>
          </Select>
        </Space>
      </Modal>
    </DashboardLayout>
  );
} 