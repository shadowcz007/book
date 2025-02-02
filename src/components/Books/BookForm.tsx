'use client';

import React from 'react';
import { Form, Input, DatePicker, InputNumber, Modal } from 'antd';
import { Book } from '@/types';
import dayjs from 'dayjs';

interface BookFormProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: Partial<Book>) => void;
  initialValues?: Partial<Book>;
  title: string;
}

export default function BookForm({ 
  open, 
  onCancel, 
  onSubmit, 
  initialValues,
  title 
}: BookFormProps) {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = {
        ...values,
        publish_date: values.publish_date ? values.publish_date.format('YYYY-MM-DD') : undefined,
      };
      onSubmit(formData);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <Modal
      open={open}
      title={title}
      onCancel={onCancel}
      onOk={handleSubmit}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues ? {
          ...initialValues,
          publish_date: initialValues.publish_date ? dayjs(initialValues.publish_date) : undefined,
        } : undefined}
      >
        <Form.Item
          name="title"
          label="书名"
          rules={[{ required: true, message: '请输入书名' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="author"
          label="作者"
          rules={[{ required: true, message: '请输入作者' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="isbn"
          label="ISBN"
          rules={[
            { required: true, message: '请输入ISBN' },
            {
              validator: async (_, value) => {
                if (!value) return;
                try {
                  const response = await fetch(`/api/books/check-isbn?isbn=${value}`);
                  const data = await response.json();
                  if (data.exists && (!initialValues || initialValues.isbn !== value)) {
                    throw new Error('该ISBN已存在');
                  }
                } catch (error: any) {
                  throw new Error(error.message || 'ISBN验证失败');
                }
              }
            }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="publisher"
          label="出版社"
          rules={[{ required: true, message: '请输入出版社' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="publish_date"
          label="出版日期"
          rules={[{ required: true, message: '请选择出版日期' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="category"
          label="分类"
          rules={[{ required: true, message: '请输入分类' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label="描述"
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          name="stock"
          label="库存"
          rules={[{ required: true, message: '请输入库存数量' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
} 