'use client';

import { useEffect, useState } from 'react';
import { Form, Input, Select, Button, message } from 'antd';
import { add_book_admin, get_authors_and_categories } from '@/app/sever/admin/route';

interface Author {
  author_id: number;
  author_name: string;
}

interface Category {
  category_id: number;
  category_name: string;
}

interface FormData {
  Title: string;
  PublishYear: string;
  Language: string;
  DocumentType: string;
  author_id: number;
  category_id: number;
}

export default function AddBookPage() {
  const [form] = Form.useForm();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAuthorsAndCategories();
  }, []);

  const fetchAuthorsAndCategories = async () => {
    try {
      const response = await get_authors_and_categories({
        api_key: 'changeme',
        token: localStorage.getItem('token') || '',
      });
      if (response.success) {
        setAuthors(response.authors);
        setCategories(response.categories);
      } else {
        message.error('Không thể tải danh sách tác giả và danh mục');
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi khi tải dữ liệu');
    }
  };

  const onFinish = async (values: FormData) => {
    setLoading(true);
    try {
      const response = await add_book_admin(values);

      if (response.success) {
        message.success('Thêm sách thành công');
        form.resetFields();
      } else {
        message.error(response.message || 'Thêm sách thất bại');
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi khi thêm sách');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Thêm Sách Mới</h1>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          label="Tên sách"
          name="Title"
          rules={[{ required: true, message: 'Vui lòng nhập tên sách' }]}
        >
          <Input placeholder="Nhập tên sách" />
        </Form.Item>

        <Form.Item
          label="Năm phát hành"
          name="PublishYear"
          rules={[{ required: true, message: 'Vui lòng nhập năm phát hành' }]}
        >
          <Input placeholder="Nhập năm phát hành" type="number" />
        </Form.Item>

        <Form.Item
          label="Ngôn ngữ"
          name="Language"
          rules={[{ required: true, message: 'Vui lòng nhập ngôn ngữ' }]}
        >
          <Input placeholder="Nhập ngôn ngữ" />
        </Form.Item>

        <Form.Item
          label="Loại tài liệu"
          name="DocumentType"
          rules={[{ required: true, message: 'Vui lòng chọn loại tài liệu' }]}
        >
          <Select
            placeholder="Chọn loại tài liệu"
            options={[
              { value: 'PDF', label: 'PDF' },
              { value: 'ePub', label: 'ePub' },
              { value: 'DOC', label: 'DOC' },
              { value: 'TXT', label: 'Text' }
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Tác giả"
          name="author_id"
          rules={[{ required: true, message: 'Vui lòng chọn tác giả' }]}
        >
          <Select
            placeholder="Chọn tác giả"
            options={authors.map(author => ({
              value: author.author_id,
              label: author.author_name
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Danh mục"
          name="category_id"
          rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
        >
          <Select
            placeholder="Chọn danh mục"
            options={categories.map(category => ({
              value: category.category_id,
              label: category.category_name
            }))}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Thêm sách
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
