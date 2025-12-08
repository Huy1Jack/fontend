"use client";
import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Modal, 
  message, 
  Card, 
  Avatar, 
  Tag, 
  Tooltip, 
  Empty, 
  Form, 
  DatePicker // Thay InputNumber bằng DatePicker
} from 'antd';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Users, 
  BookOpenCheck, 
  CalendarDays, 
  MapPin 
} from 'lucide-react';
import { get_authors_and_categories, del_authors, edit_authors, add_authors } from '@/app/actions/adminActions';
import type { ColumnsType } from 'antd/es/table';
import { getAuthCookie } from "@/app/actions/authActions";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dayjs from 'dayjs'; // Import dayjs để xử lý ngày tháng

// --- Interface Definitions ---
interface Author {
  author_id: number;
  author_name: string;
  nationality?: string;
  birth_year?: number;
  death_year?: number | null;
  biography?: string;
  image?: string; 
}

const getAvatarColor = (name: string) => {
  const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#eb2f96', '#10b981', '#6366f1'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [filteredAuthors, setFilteredAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentAuthorId, setCurrentAuthorId] = useState<number | null>(null);
  
  const [form] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    fetchAuthors();
    checkUser();
  }, []);

  useEffect(() => {
    const lower = searchText.toLowerCase();
    const filtered = authors.filter(a => 
      a.author_name.toLowerCase().includes(lower) || 
      (a.nationality && a.nationality.toLowerCase().includes(lower))
    );
    setFilteredAuthors(filtered);
  }, [searchText, authors]);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const response = await get_authors_and_categories();
      if (response.success) {
        setAuthors(response.data.authors || []);
      } else {
        message.error(response.message || 'Lỗi tải dữ liệu');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkUser = async () => {
    try {
      const token = await getAuthCookie();
      if (!token) {
        router.push('/');
        return;
      }
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (![1, 2].includes(payload.role)) {
        message.error("Bạn không có quyền truy cập");
        router.push('/');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- Mở Modal Add ---
  const openAddModal = () => {
    setModalMode('add');
    setCurrentAuthorId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // --- Mở Modal Edit ---
  const openEditModal = (author: Author) => {
    setModalMode('edit');
    setCurrentAuthorId(author.author_id);
    
    // Convert số năm (int) sang dayjs object để hiển thị lên DatePicker
    form.setFieldsValue({
      author_name: author.author_name,
      nationality: author.nationality,
      birth_year: author.birth_year ? dayjs(author.birth_year.toString()) : null,
      death_year: author.death_year ? dayjs(author.death_year.toString()) : null,
      biography: author.biography
    });
    setIsModalVisible(true);
  };

  // --- Xử lý Submit ---
  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Convert dayjs object về số nguyên (int) để gửi cho API
      const birthYearInt = values.birth_year ? values.birth_year.year() : null;
      const deathYearInt = values.death_year ? values.death_year.year() : null;

      const datauser = {
        author_name: values.author_name,
        biography: values.biography,
        birth_year: birthYearInt, // Gửi số
        death_year: deathYearInt, // Gửi số hoặc null
        nationality: values.nationality, 
      };

      let response;
      if (modalMode === 'add') {
        response = await add_authors(datauser);
      } else {
        response = await edit_authors({
          ...datauser,
          author_id: currentAuthorId
        });
      }

      if (response.success) {
        message.success(modalMode === 'add' ? 'Thêm thành công' : 'Cập nhật thành công');
        setIsModalVisible(false);
        form.resetFields();
        fetchAuthors(); 
      } else {
        message.error(response.message || 'Thao tác thất bại');
      }

    } catch (error) {
      console.error('Validate Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (author: Author) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc muốn xóa tác giả "${author.author_name}"?`,
      okText: 'Xóa ngay',
      okType: 'danger',
      cancelText: 'Hủy',
      centered: true,
      onOk: async () => {
        try {
          const response = await del_authors({ author_id: author.author_id });
          if (response.success) {
            message.success('Đã xóa tác giả');
            fetchAuthors();
          } else {
            message.error(response.message || 'Xóa thất bại');
          }
        } catch (error) {
            message.error('Lỗi hệ thống');
        }
      },
    });
  };

  const columns: ColumnsType<Author> = [
    {
      title: 'Tác giả',
      dataIndex: 'author_name',
      key: 'author_name',
      sorter: (a, b) => a.author_name.localeCompare(b.author_name),
      render: (text, record) => (
        <div className="flex items-center gap-3">
            {record.image ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 shadow-sm">
                    <Image src={record.image} alt={text} fill sizes="40px" className="object-cover"/>
                </div>
            ) : (
                <Avatar style={{ backgroundColor: getAvatarColor(text), verticalAlign: 'middle' }} size="large">
                    {text.charAt(0).toUpperCase()}
                </Avatar>
            )}
            <div className="flex flex-col">
                <span className="font-semibold text-gray-800 text-base">{text}</span>
                {record.nationality && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin size={10} /> {record.nationality}
                    </span>
                )}
            </div>
        </div>
      )
    },
    {
      title: 'Thông tin',
      key: 'years',
      width: 150,
      render: (_, record) => (
        <div className="flex flex-col gap-1">
             <Tag icon={<CalendarDays size={12} className="mr-1"/>} color="blue" className="w-fit m-0 border-0 bg-blue-50 text-blue-600 rounded-md">
                Sinh: {record.birth_year || '?'}
             </Tag>
             {record.death_year && (
                 <Tag color="default" className="w-fit m-0 border-0 bg-gray-100 text-gray-500 rounded-md">
                    Mất: {record.death_year}
                 </Tag>
             )}
        </div>
      ),
    },
    {
      title: 'Tiểu sử',
      dataIndex: 'biography',
      key: 'biography',
      width: '40%',
      render: (text) => (
        <Tooltip title={text}>
             <p className="text-gray-500 line-clamp-2 text-sm leading-relaxed max-w-prose cursor-help">
                {text || <span className="italic text-gray-300">Chưa cập nhật tiểu sử</span>}
            </p>
        </Tooltip>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      align: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-end gap-2">
          <Tooltip title="Chỉnh sửa">
            <Button 
                type="text" shape="circle" icon={<Edit size={16} className="text-indigo-600" />} 
                className="bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
                type="text" shape="circle" danger icon={<Trash2 size={16} />}
                className="hover:bg-red-50 transition-colors"
                onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Quản lý tác giả</h1>
            <p className="text-gray-500 mt-1 text-sm">Danh sách và thông tin các tác giả trong hệ thống thư viện</p>
        </div>
        <div className="flex items-center gap-3">
             <div className="relative group">
                <Input 
                    placeholder="Tìm theo tên..." 
                    prefix={<Search size={16} className="text-gray-400 group-hover:text-indigo-500 transition-colors" />}
                    className="w-64 rounded-full border-gray-200 hover:border-indigo-400 focus:border-indigo-500 shadow-sm"
                    onChange={(e) => setSearchText(e.target.value)}
                />
             </div>
             <Button 
                type="primary" icon={<Plus size={18} />} onClick={openAddModal}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0 hover:shadow-lg h-10 px-6 rounded-full font-medium flex items-center gap-1 transition-all duration-300"
             >
                Thêm mới
             </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Card bordered={false} className="rounded-xl shadow-sm bg-white border border-gray-100 p-0 flex flex-col justify-center hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><Users size={24} /></div>
                <div>
                    <p className="text-gray-400 text-xs uppercase font-bold">Tổng số tác giả</p>
                    <h3 className="text-2xl font-bold text-gray-800">{authors.length}</h3>
                </div>
            </div>
         </Card>
         <Card bordered={false} className="rounded-xl shadow-sm bg-white border border-gray-100 p-0 flex flex-col justify-center hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600"><BookOpenCheck size={24} /></div>
                <div>
                    <p className="text-gray-400 text-xs uppercase font-bold">Đủ tiểu sử</p>
                    <h3 className="text-2xl font-bold text-gray-800">{authors.filter(a => a.biography && a.biography.length > 10).length}</h3>
                </div>
            </div>
         </Card>
          <Card bordered={false} className="rounded-xl shadow-sm bg-white border border-gray-100 p-0 flex flex-col justify-center hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 rounded-lg text-purple-600"><CalendarDays size={24} /></div>
                <div>
                    <p className="text-gray-400 text-xs uppercase font-bold">Cập nhật gần nhất</p>
                    <h3 className="text-base font-bold text-gray-800">Hôm nay</h3>
                </div>
            </div>
         </Card>
      </div>

      <Card bordered={false} className="shadow-lg shadow-gray-200/50 rounded-2xl overflow-hidden" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredAuthors}
          loading={loading}
          rowKey="author_id"
          pagination={{ pageSize: 8, className: "p-4" }}
          className="custom-table"
          locale={{ emptyText: <Empty description="Chưa có dữ liệu tác giả" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
        />
      </Card>

      <Modal
        title={
            <div className="flex items-center gap-2 text-gray-800 text-xl font-bold pb-2 border-b border-gray-100">
                {modalMode === 'add' ? (<><Plus className="text-indigo-600" size={24} /> Thêm tác giả mới</>) : (<><Edit className="text-indigo-600" size={24} /> Cập nhật thông tin</>)}
            </div>
        }
        open={isModalVisible}
        onOk={handleModalSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText={modalMode === 'add' ? "Thêm mới" : "Lưu thay đổi"}
        cancelText="Hủy bỏ"
        confirmLoading={loading}
        okButtonProps={{ className: 'bg-indigo-600 hover:bg-indigo-500 border-indigo-600 h-10 px-6 rounded-lg font-medium' }}
        cancelButtonProps={{ className: 'h-10 px-6 rounded-lg hover:text-indigo-600 hover:border-indigo-600' }}
        centered
        width={650}
        className="rounded-2xl overflow-hidden"
      >
        <Form form={form} layout="vertical" className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <div className="md:col-span-2">
            <Form.Item label={<span className="font-medium text-gray-700">Tên tác giả</span>} name="author_name" rules={[{ required: true, message: 'Vui lòng nhập tên tác giả' }]}>
              <Input size="large" placeholder="Nhập tên đầy đủ..." className="rounded-lg" />
            </Form.Item>
          </div>

          {/* Thay InputNumber bằng DatePicker (Year Picker) */}
          <Form.Item
            label={<span className="font-medium text-gray-700">Năm sinh</span>}
            name="birth_year"
            rules={[{ required: true, message: 'Vui lòng chọn năm sinh' }]}
          >
            <DatePicker 
                picker="year" 
                size="large" 
                className="w-full rounded-lg" 
                placeholder="Chọn năm sinh"
                format="YYYY"
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-gray-700">Năm mất (nếu có)</span>}
            name="death_year"
            dependencies={['birth_year']}
            rules={[
                ({ getFieldValue }) => ({
                    validator(_, value) {
                      // So sánh năm (year vs year)
                      if (!value || !getFieldValue('birth_year') || value.year() >= getFieldValue('birth_year').year()) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Năm mất phải lớn hơn năm sinh'));
                    },
                }),
            ]}
          >
            <DatePicker 
                picker="year" 
                size="large" 
                className="w-full rounded-lg" 
                placeholder="Chọn năm mất"
                format="YYYY"
            />
          </Form.Item>

          <div className="md:col-span-2">
            <Form.Item label={<span className="font-medium text-gray-700">Tiểu sử</span>} name="biography">
              <Input.TextArea placeholder="Mô tả ngắn về cuộc đời và sự nghiệp..." rows={5} className="rounded-lg" showCount maxLength={2000} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}