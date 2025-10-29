"use client";
import { useEffect, useState } from 'react';
import { Table, Space, Button, Input, Form, Modal, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { get_user, edit_email_admin, edit_pass_admin, del_user_admin } from '@/app/sever/admin/route';
import { useRouter } from 'next/navigation';
import type { ColumnsType } from 'antd/es/table';

interface User {
  id: number;
  name: string;
  email: string;
  role: number;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [emailForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await get_user();
      if (response.success) {
        setUsers(response.data);
      } else {
        message.error(response.message || 'Không thể tải danh sách người dùng');
      }
    } catch (error) {
      message.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (values: { newPassword: string }) => {
    if (!currentUser) return;

    if (values.newPassword === currentUser.email) {
      message.error('Mật khẩu không được trùng với email vì lý do bảo mật!');
      return;
    }

    try {
      const response = await edit_pass_admin({
        email: currentUser.email,
        newPassword: values.newPassword
      });
      if (response.success) {
        message.success('Cập nhật mật khẩu thành công');
        setPasswordModalVisible(false);
        passwordForm.resetFields();
      } else {
        message.error(response.message || 'Cập nhật mật khẩu thất bại');
      }
    } catch (error) {
      message.error('Cập nhật mật khẩu thất bại');
    }
  };

  // Handle email change
  const handleEmailChange = async (values: { newEmail: string }) => {
    if (!currentUser) return;

    if (values.newEmail === currentUser.email) {
      message.error('Email mới không được trùng với email cũ!');
      return;
    }

    try {
      const response = await edit_email_admin({
        oldEmail: currentUser.email,
        newEmail: values.newEmail
      });
      
      if (response.success) {
        message.success('Cập nhật email thành công');
        fetchUsers();
        setEmailModalVisible(false);
        emailForm.resetFields();
      } else {
        message.error(response.message || 'Cập nhật email thất bại');
      }
    } catch (error) {
      message.error('Cập nhật email thất bại');
    }
  };

  // Handle user deletion
  const handleDelete = async (user: User) => {
    try {
      const response = await del_user_admin({ email: user.email });
      if (response.success) {
        message.success('Xóa tài khoản thành công');
        fetchUsers();
      } else {
        message.error(response.message || 'Xóa tài khoản thất bại');
      }
    } catch (error) {
      message.error('Xóa tài khoản thất bại');
    }
  };

  const getRoleName = (role: number) => {
    switch (role) {
      case 1:
        return 'Admin';
      case 2:
        return 'Staff';
      case 3:
        return 'User';
      default:
        return 'Unknown';
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: number) => getRoleName(role),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<MailOutlined />}
            type="primary"
            onClick={() => {
              setCurrentUser(record);
              setEmailModalVisible(true);
              emailForm.resetFields();
            }}
          >
            Đổi Email
          </Button>
          <Button
            icon={<LockOutlined />}
            onClick={() => {
              setCurrentUser(record);
              setPasswordModalVisible(true);
              passwordForm.resetFields();
            }}
          >
            Đổi mật khẩu
          </Button>
          <Popconfirm
            title="Xóa tài khoản"
            description={`Bạn có chắc chắn muốn xóa tài khoản "${record.name}" (${record.email})?`}
            onConfirm={() => handleDelete(record)}
            okText="Có"
            cancelText="Không"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý tài khoản</h1>
      
      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="id"
        pagination={{ 
          pageSize: 10,
          showTotal: (total) => `Tổng số: ${total} tài khoản`
        }}
      />

      {/* Email Change Modal */}
      <Modal
        title="Đổi Email"
        open={emailModalVisible}
        onCancel={() => {
          setEmailModalVisible(false);
          emailForm.resetFields();
        }}
        footer={null}
      >
        {currentUser && (
          <div className="mb-4">
            <p><strong>Tài khoản:</strong> {currentUser.name}</p>
            <p><strong>Email hiện tại:</strong> {currentUser.email}</p>
          </div>
        )}
        <Form
          form={emailForm}
          layout="vertical"
          onFinish={handleEmailChange}
        >
          <Form.Item
            name="newEmail"
            label="Email mới"
            rules={[
              { required: true, message: 'Vui lòng nhập email mới!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input placeholder="Nhập email mới" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
              <Button onClick={() => {
                setEmailModalVisible(false);
                emailForm.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Password Change Modal */}
      <Modal
        title="Đổi mật khẩu"
        open={passwordModalVisible}
        onCancel={() => {
          setPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        footer={null}
      >
        {currentUser && (
          <div className="mb-4">
            <p><strong>Tài khoản:</strong> {currentUser.name}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
          </div>
        )}
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
              <Button onClick={() => {
                setPasswordModalVisible(false);
                passwordForm.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}