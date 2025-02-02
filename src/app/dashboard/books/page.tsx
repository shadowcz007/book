'use client';

import React, { useState } from 'react';
import { Table, Button, Space, Input } from 'antd';
import { books } from '@/mock/data';
import DashboardLayout from '@/components/Layout/DashboardLayout';

const { Search } = Input;

export default function BooksPage() {
  const [searchText, setSearchText] = useState('');

  const columns = [
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
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
    },
    {
      title: '出版社',
      dataIndex: 'publisher',
      key: 'publisher',
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="link">编辑</Button>
          <Button type="link" danger>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space>
          <Button type="primary">添加图书</Button>
          <Search
            placeholder="搜索图书"
            allowClear
            onSearch={value => setSearchText(value)}
            style={{ width: 200 }}
          />
        </Space>
        <Table columns={columns} dataSource={books} rowKey="id" />
      </Space>
    </DashboardLayout>
  );
}