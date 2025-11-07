"use client";
import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, InputNumber, message } from 'antd';
import { useRouter } from 'next/navigation';
import { getAuthCookie } from "@/app/sever/authcookie/route";
import { add_authors } from "@/app/sever/admin/route";

interface AuthorFormData {
  author_name: string;
  biography: string;
  birth_year: number;
  death_year: number | null;
}

export default function AddAuthor() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check user authentication and role
  const checkUser = async () => {
    try {
      const token = await getAuthCookie();
      if (!token) {
        message.error("Bạn chưa đăng nhập");
        router.push('/');
        return;
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 1) {
        message.error("Bạn không có quyền truy cập trang này");
        router.push('/');
      }
    } catch (error) {
      console.error('Error checking user:', error);
      message.error("Máy chủ không phản hồi");
      router.push('/');
    }
  };

  // Call checkUser when component mounts
  useEffect(() => {
    checkUser();
  }, []);

  const onFinish = async (values: AuthorFormData) => {
    setLoading(true);
    try {
      // Đóng gói dữ liệu theo đúng format yêu cầu
      
      const datauser = {
          author_name: values.author_name,
          biography: values.biography,
          birth_year: values.birth_year,
          death_year: values.death_year || null
      };
      const response = await add_authors(datauser);

      if (response.success) {
        message.success('Thêm tác giả thành công');
        form.resetFields();
        router.push('/admin/author');
      } else {
        message.error(response.message || 'Thêm tác giả thất bại');
      }
    } catch (error) {
      console.error('Error adding author:', error);
      message.error('Đã xảy ra lỗi khi thêm tác giả');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="THÊM TÁC GIẢ MỚI" style={{ maxWidth: 800, margin: '20px auto' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label="Tên tác giả"
          name="author_name"
          rules={[
            { required: true, message: 'Vui lòng nhập tên tác giả' },
            { max: 255, message: 'Tên tác giả không được vượt quá 255 ký tự' }
          ]}
        >
          <Input placeholder="Nhập tên tác giả" />
        </Form.Item>

        <Form.Item
          label="Tiểu sử"
          name="biography"
          rules={[
            { required: true, message: 'Vui lòng nhập tiểu sử' }
          ]}
        >
          <Input.TextArea 
            placeholder="Nhập tiểu sử của tác giả" 
            rows={4}
            showCount
            maxLength={2000}
          />
        </Form.Item>

        <Form.Item
          label="Năm sinh"
          name="birth_year"
          rules={[
            { required: true, message: 'Vui lòng nhập năm sinh' },
            {
              type: 'number',
              min: 0,
              max: new Date().getFullYear(),
              message: 'Năm sinh không hợp lệ'
            }
          ]}
        >
          <InputNumber 
            style={{ width: '100%' }}
            placeholder="Nhập năm sinh"
          />
        </Form.Item>

        <Form.Item
          label="Năm mất"
          name="death_year"
          rules={[
            {
              type: 'number',
              min: 0,
              max: new Date().getFullYear(),
              message: 'Năm mất không hợp lệ'
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('birth_year') <= value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Năm mất phải lớn hơn năm sinh'));
              },
            }),
          ]}
        >
          <InputNumber 
            style={{ width: '100%' }}
            placeholder="Nhập năm mất (nếu có)"
          />
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button onClick={() => router.push('/admin/author')}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Thêm tác giả
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
}
