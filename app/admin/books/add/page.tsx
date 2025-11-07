'use client';

import { useEffect, useState } from 'react';
import { Form, Input, Select, Button, message, Space } from 'antd';
import { add_book_admin, get_authors_and_categories, get_publishers } from '@/app/sever/admin/route';

interface Author {
  author_id: number;
  author_name: string;
}

interface Category {
  category_id: number;
  category_name: string;
}

interface Publisher {
  publisher_id: number;
  publisher_name: string;
  address: string;
  phone: string;
  email: string;
}

interface FormData {
  Title: string;
  Description?: string;
  ISBN?: string;
  PublishYear: number;
  Language: string;
  DocumentType: string;
  IsPublic?: boolean;
  image?: string;
  publisher_id: number;
  category_id: number;
  author_ids: number[]; // Array of author IDs
}

export default function AddBookPage() {
  const [form] = Form.useForm();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAuthorsAndCategories();
    fetchPublishers();
  }, []);

  const fetchPublishers = async () => {
    try {
      const response = await get_publishers({});
      if (response.success) {
        setPublishers(response.publishers || []);
      } else {
        message.error('Không thể tải danh sách nhà xuất bản');
      }
    } catch (error) {
      message.error('Đã xảy ra lỗi khi tải dữ liệu nhà xuất bản');
    }
  };

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
      // Validate author_ids array
      if (!values.author_ids || values.author_ids.length === 0) {
        message.error('Vui lòng chọn ít nhất một tác giả');
        return;
      }

      // Prepare form data
      const formData = {
        ...values,
        IsPublic: values.IsPublic === undefined ? true : values.IsPublic,
      };

      const response = await add_book_admin({
        ...formData,
        author_ids: Array.isArray(formData.author_ids) ? formData.author_ids : [formData.author_ids]
      });

      if (response.success) {
        message.success('Thêm sách thành công');
        form.resetFields();
      } else {
        message.error(response.message || 'Thêm sách thất bại');
      }
    } catch (error) {
      console.error('Error adding book:', error);
      message.error('Đã xảy ra lỗi khi thêm sách');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Thêm Sách Mới</h1>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          IsPublic: true,
          Language: 'Tiếng Việt',
          DocumentType: 'PDF'
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            label="Tên sách"
            name="Title"
            rules={[{ required: true, message: 'Vui lòng nhập tên sách' }]}
            className="md:col-span-2"
          >
            <Input placeholder="Nhập tên sách" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="Description"
            className="md:col-span-2"
          >
            <Input.TextArea
              placeholder="Nhập mô tả sách"
              rows={4}
            />
          </Form.Item>

          <Form.Item
            label="ISBN"
            name="ISBN"
          >
            <Input placeholder="Nhập mã ISBN" />
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
            name="author_ids"
            rules={[{ 
              required: true, 
              message: 'Vui lòng chọn ít nhất một tác giả',
              type: 'array'
            }]}
            className="md:col-span-2"
          >
            <Select
              mode="multiple"
              placeholder="Chọn một hoặc nhiều tác giả"
              optionFilterProp="label"
              options={authors.map(author => ({
                value: author.author_id,
                label: author.author_name
              }))}
              showSearch
              showArrow
              maxTagCount={3}
              maxTagTextLength={15}
            />
          </Form.Item>

          <Form.Item
            label="Danh mục"
            name="category_id"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          >
            <Select
              placeholder="Chọn danh mục"
              optionFilterProp="label"
              options={categories.map(category => ({
                value: category.category_id,
                label: category.category_name
              }))}
              showSearch
            />
          </Form.Item>

          <Form.Item
            label="Nhà xuất bản"
            name="publisher_id"
            tooltip="Thông tin nhà xuất bản"
            rules={[{ required: true, message: 'Vui lòng chọn nhà xuất bản' }]}
          >
            <Select
              placeholder="Chọn nhà xuất bản"
              optionFilterProp="label"
              allowClear
              options={publishers.map(pub => ({
                value: pub.publisher_id,
                label: pub.publisher_name,
                title: `${pub.publisher_name} - ${pub.address}`,
              }))}
              showSearch
              optionRender={(option) => (
                <Space direction="vertical" size="small">
                  <div>{option.data.label}</div>
                  <div className="text-xs text-gray-500">
                    Địa chỉ: {publishers.find(p => p.publisher_id === option.value)?.address}
                  </div>
                  <div className="text-xs text-gray-500">
                    Email: {publishers.find(p => p.publisher_id === option.value)?.email}
                  </div>
                  <div className="text-xs text-gray-500">
                    SĐT: {publishers.find(p => p.publisher_id === option.value)?.phone}
                  </div>
                </Space>
              )}
            />
          </Form.Item>

          <Form.Item
            label="Ảnh bìa"
            name="image"
          >
            <Input placeholder="Nhập đường dẫn ảnh" />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="IsPublic"
            valuePropName="checked"
          >
            <Select
              options={[
                { value: true, label: 'Công khai' },
                { value: false, label: 'Riêng tư' }
              ]}
            />
          </Form.Item>
        </div>

        <Form.Item className="mt-6">
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Thêm sách
            </Button>
            <Button onClick={() => form.resetFields()}>
              Xóa form
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}
