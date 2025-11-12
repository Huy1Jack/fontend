"use client";
import { useEffect, useState } from 'react';
import { Table, Space, Button, Input, Modal, message, Form } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { get_publishers, del_publishers, edit_publishers } from '@/app/sever/admin/route';
import type { ColumnsType } from 'antd/es/table';
import { getAuthCookie } from "@/app/sever/authcookie/route";
import { useRouter } from 'next/navigation';

interface Publisher {
  publisher_id: number;
  publisher_name: string;
  address: string;
  email: string;
  phone: string;
}

export default function PublishersPage() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(null);
  const [form] = Form.useForm();
  const router = useRouter();
  useEffect(() => {
    fetchPublishers();
    checkUser();
  }, []);
  const checkUser = async () => {
    try {
      const token = await getAuthCookie();
      if (!token) {
        message.error("Bạn chưa đăng nhập");
        router.push("/");
        return;
      }

      const payload = JSON.parse(atob(token.split(".")[1]));
      if (![1, 2].includes(payload.role)) {
        message.error("Bạn không có quyền truy cập trang này");
        router.push("/");
      }
    } catch (error) {
      console.error("Error checking user:", error);
      message.error("Máy chủ không phản hồi");
      router.push("/");
    }
  };
  const handleAdd = () => {
    router.push('/admin/publishers/add');
    message.info('Thêm mới nhà xuất bản');
  };  
  const fetchPublishers = async () => {
    try {
      setLoading(true);
      const response = await get_publishers();
      if (response.success) {
        setPublishers(response.data || []);
      } else {
        message.error(response.message || 'Lỗi khi tải dữ liệu nhà xuất bản');
      }
    } catch (error) {
      message.error('Không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Publisher> = [
    {
      title: 'ID',
      dataIndex: 'publisher_id',
      key: 'publisher_id',
      width: 80,
    },
    {
      title: 'Tên nhà xuất bản',
      dataIndex: 'publisher_name',
      key: 'publisher_name',
      sorter: (a, b) => a.publisher_name.localeCompare(b.publisher_name),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <a href={`mailto:${email}`} className="text-blue-600 hover:underline">
          {email}
        </a>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => (
        <a href={`tel:${phone}`} className="text-blue-600 hover:underline">
          {phone}
        </a>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="primary"
            onClick={() => {
              setEditingPublisher(record);
              form.setFieldsValue(record);
              setEditModalVisible(true);
            }}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Xác nhận xóa',
                content: `Bạn có chắc chắn muốn xóa nhà xuất bản "${record.publisher_name}"?`,
                okText: 'Xóa',
                okType: 'danger',
                cancelText: 'Hủy',
                onOk: async () => {
                  try {
                    const response = await del_publishers({
                      publisher_id: record.publisher_id
                    });

                    if (response.success) {
                      message.success('Xóa nhà xuất bản thành công');
                      fetchPublishers(); // Refresh the list
                    } else {
                      message.error(response.message || 'Xóa nhà xuất bản thất bại');
                    }
                  } catch (error) {
                    console.error('Error deleting publisher:', error);
                    message.error('Đã xảy ra lỗi khi xóa nhà xuất bản');
                  }
                },
              });
            }}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý nhà xuất bản</h1>
<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm nhà xuất bản
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={publishers}
        loading={loading}
        rowKey="publisher_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng số ${total} nhà xuất bản`,
        }}
        scroll={{ x: 1000 }}
      />

      <Modal
        title="Chỉnh sửa thông tin nhà xuất bản"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            try {
              if (!editingPublisher) return;
              
              const datauser = {
                ...values,
                publisher_id: editingPublisher.publisher_id
              };
              console.log(datauser);
              const response = await edit_publishers(datauser);

              if (response.success) {
                message.success('Cập nhật thông tin nhà xuất bản thành công');
                setEditModalVisible(false);
                fetchPublishers();
              } else {
                message.error(response.message || 'Cập nhật thông tin thất bại');
              }
            } catch (error) {
              console.error('Error updating publisher:', error);
              message.error('Đã xảy ra lỗi khi cập nhật thông tin');
            }
          }}
        >
          <Form.Item
            name="publisher_name"
            label="Tên nhà xuất bản"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhà xuất bản' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <div className="flex justify-end gap-2">
              <Button onClick={() => {
                setEditModalVisible(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
