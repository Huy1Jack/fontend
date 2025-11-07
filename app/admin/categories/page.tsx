"use client";
import { useEffect, useState } from 'react';
import { Table, Space, Button, Input, Modal, message, Form } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { get_authors_and_categories, del_categories, edit_categories } from '@/app/sever/admin/route';
import type { ColumnsType } from 'antd/es/table';

interface Category {
  category_id: number;
  category_name: string;
  description?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await get_authors_and_categories();
      
      if (response.success) {
        setCategories(response.categories || []);
      } else {
        message.error(response.message || 'Lỗi khi tải dữ liệu thể loại');
      }
    } catch (error) {
      message.error('Không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Category> = [
    {
      title: 'ID',
      dataIndex: 'category_id',
      key: 'category_id',
      width: 100,
    },
    {
      title: 'Tên thể loại',
      dataIndex: 'category_name',
      key: 'category_name',
      sorter: (a, b) => a.category_name.localeCompare(b.category_name),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (description) => description || 'Chưa có mô tả',
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
              setEditingCategory(record);
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
                content: `Bạn có chắc chắn muốn xóa thể loại "${record.category_name}"?`,
                okText: 'Xóa',
                okType: 'danger',
                cancelText: 'Hủy',
                onOk: async () => {
                  try {
                    const response = await del_categories(record.category_id);
                    
                    if (response.success) {
                      message.success('Xóa thể loại thành công');
                      fetchCategories(); // Refresh the list
                    } else {
                      message.error(response.message || 'Xóa thể loại thất bại');
                    }
                  } catch (error) {
                    console.error('Error deleting category:', error);
                    message.error('Đã xảy ra lỗi khi xóa thể loại');
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

  const handleEdit = async (values: any) => {
    if (!editingCategory) return;

    try {
      const updatedData = {
        ...values,
        category_id: editingCategory.category_id
      };
      console.log(updatedData);
      const response = await edit_categories(updatedData);
      
      if (response.success) {
        message.success('Cập nhật thể loại thành công');
        setEditModalVisible(false);
        fetchCategories(); // Refresh the list
      } else {
        message.error(response.message || 'Cập nhật thể loại thất bại');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      message.error('Đã xảy ra lỗi khi cập nhật thể loại');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý thể loại sách</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            window.location.href = '/admin/categories/add';
          }}
        >
          Thêm thể loại
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        loading={loading}
        rowKey="category_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng số ${total} thể loại`,
        }}
      />

      <Modal
        title="Chỉnh sửa thể loại"
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
          onFinish={handleEdit}
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
              placeholder="Nhập mô tả cho thể loại"
              rows={4}
            />
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
