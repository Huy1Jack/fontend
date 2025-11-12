"use client";
import { useEffect, useState } from 'react';
import { Table, Space, Button, Input, Modal, message, DatePicker } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { get_authors_and_categories, del_authors, edit_authors } from '@/app/sever/admin/route';
import type { ColumnsType } from 'antd/es/table';
import { getAuthCookie } from "@/app/sever/authcookie/route";
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
interface Author {
  author_id: number;
  author_name: string;
  nationality?: string;
  birth_year?: number;
  death_year?: number;
  biography?: string;
}

interface EditFormState {
  author_id: number;
  author_name: string;
  nationality: string;
  birth_year: number | null;
  death_year: number | null;
  biography: string;
}

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>({
    author_id: 0,
    author_name: '',
    nationality: '',
    birth_year: null,
    death_year: null,
    biography: ''
  });
  const router = useRouter();
  useEffect(() => {
    fetchAuthors();
    Check_user();
  }, []);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const response = await get_authors_and_categories();
      if (response.success) {
        setAuthors(response.data.authors || []);
      } else {
        message.error(response.message || 'Lỗi khi tải dữ liệu tác giả');
      }
    } catch (error) {
      message.error('Không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };
  const Check_user = async () => {
    try {
      const token = await getAuthCookie();
      if (!token) {
        message.error("Không tìm thấy token xác thực");
        router.push('/');
        return;
      }
      const payload = JSON.parse(atob(token.split('.')[1]));
      if ((payload.role == 1) || (payload.role == 2)) {
      } else {
        message.error("Bạn không có quyền truy cập trang này");
        router.push('/');
      }
    } catch (error: any) {
      message.error("Máy chủ không phản hồi");
    } finally {
      setLoading(false);
    }
  };
  const handleAdd = () => {
    router.push('/admin/author/add');
    message.info('Thêm mới tác giả');
  };
  const handleEdit = (author: Author) => {
    setEditForm({
      author_id: author.author_id,
      author_name: author.author_name,
      nationality: author.nationality || '',
      birth_year: author.birth_year || null,
      death_year: author.death_year || null,
      biography: author.biography || ''
    });
    setIsEditModalVisible(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await edit_authors({
        author_id: editForm.author_id,
        author_name: editForm.author_name,
        nationality: editForm.nationality,
        birth_year: editForm.birth_year,
        death_year: editForm.death_year,
        biography: editForm.biography
      });

      if (response.success) {
        message.success('Cập nhật tác giả thành công');
        setIsEditModalVisible(false);
        fetchAuthors();
      } else {
        message.error(response.message || 'Cập nhật tác giả thất bại');
      }
    } catch (error) {
      message.error('Không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };
  const columns: ColumnsType<Author> = [
    {
      title: 'ID',
      dataIndex: 'author_id',
      key: 'author_id',
      width: 100,
    },
    {
      title: 'Tên tác giả',
      dataIndex: 'author_name',
      key: 'author_name',
      sorter: (a, b) => a.author_name.localeCompare(b.author_name),
    },
    {
      title: 'Tiểu sử',
      dataIndex: 'biography',
      key: 'biography',
      sorter: (a, b) => (a.biography || '').localeCompare(b.biography || ''),
    },
    {
      title: 'Năm sinh',
      dataIndex: 'birth_year',
      key: 'birth_year',
      render: (birth_year) => birth_year || 'Chưa cập nhật',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Xác nhận xóa',
                content: `Bạn có chắc chắn muốn xóa tác giả "${record.author_name}"?`,
                okText: 'Xóa',
                okType: 'danger',
                cancelText: 'Hủy',
                onOk: async () => {
                  try {
                    const response = await del_authors({
                      author_id: record.author_id
                    });

                    if (response.success) {
                      message.success('Xóa tác giả thành công');
                      fetchAuthors(); // Refresh danh sách
                    } else {
                      message.error(response.message || 'Xóa tác giả thất bại');
                    }
                  } catch (error) {
                    console.error('Error deleting author:', error);
                    message.error('Đã xảy ra lỗi khi xóa tác giả');
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
        <h1 className="text-2xl font-bold">Quản lý tác giả</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm tác giả
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={authors}
        loading={loading}
        rowKey="author_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng số ${total} tác giả`,
        }}
      />

      <Modal
        title="Chỉnh sửa tác giả"
        open={isEditModalVisible}
        onOk={handleSave}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên tác giả</label>
            <Input
              value={editForm.author_name}
              onChange={(e) => setEditForm({ ...editForm, author_name: e.target.value })}
              placeholder="Nhập tên tác giả"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Năm sinh</label>
            <DatePicker
              picker="year"
              value={editForm.birth_year ? dayjs(editForm.birth_year.toString()) : null}
              onChange={(date) => setEditForm({ ...editForm, birth_year: date ? date.year() : null })}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Năm mất</label>
            <DatePicker
              picker="year"
              value={editForm.death_year ? dayjs(editForm.death_year.toString()) : null}
              onChange={(date) => setEditForm({ ...editForm, death_year: date ? date.year() : null })}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tiểu sử</label>
            <Input.TextArea
              value={editForm.biography}
              onChange={(e) => setEditForm({ ...editForm, biography: e.target.value })}
              placeholder="Nhập tiểu sử"
              rows={4}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
