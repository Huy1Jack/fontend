"use client";
import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { add_categories } from '@/app/sever/admin/route';
import { useRouter } from 'next/navigation';

interface CategoryFormData {
  category_name: string;
  description: string;
}

export default function AddCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: CategoryFormData) => {
    try {
      setLoading(true);
      const response = await add_categories(values);

      if (response.success) {
        message.success('Thêm thể loại thành công');
        router.push('/admin/categories'); // Redirect back to categories list
      } else {
        message.error(response.message || 'Thêm thể loại thất bại');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      message.error('Đã xảy ra lỗi khi thêm thể loại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card title="Thêm thể loại mới" className="max-w-2xl mx-auto">
        <Form
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="Tên thể loại"
            name="category_name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên thể loại' },
              { max: 100, message: 'Tên thể loại không được vượt quá 100 ký tự' }
            ]}
          >
            <Input placeholder="Nhập tên thể loại" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
          >
            <Input.TextArea 
              placeholder="Nhập mô tả cho thể loại (không bắt buộc)"
              rows={4}
            />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end gap-2">
              <Button onClick={() => router.push('/admin/categories')}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Thêm thể loại
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}