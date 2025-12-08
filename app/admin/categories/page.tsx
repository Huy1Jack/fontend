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
  Tooltip, 
  Empty, 
  Form, 
  Tag 
} from 'antd';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  LibraryBig, 
  Bookmark, 
  LayoutList 
} from 'lucide-react';
// Đảm bảo import đúng đường dẫn action của bạn
import { get_authors_and_categories, del_categories, edit_categories, add_categories } from '@/app/actions/adminActions';
import type { ColumnsType } from 'antd/es/table';
import { getAuthCookie } from "@/app/actions/authActions"; // Hoặc path đúng của bạn
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// --- Interface Definitions ---
interface Category {
  category_id: number;
  category_name: string;
  description?: string;
  // Giả lập trường image để demo next/image, thực tế lấy từ DB hoặc dùng placeholder
  image?: string; 
}

// --- Helper: Màu ngẫu nhiên cho avatar text ---
const getAvatarColor = (name: string) => {
  const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#eb2f96', '#10b981', '#6366f1'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentCategoryId, setCurrentCategoryId] = useState<number | null>(null);

  const [form] = Form.useForm();

  // --- Initial Load ---
  useEffect(() => {
    fetchCategories();
    checkUser();
  }, []);

  // --- Filter Logic ---
  useEffect(() => {
    const lower = searchText.toLowerCase();
    const filtered = categories.filter(c => 
      c.category_name.toLowerCase().includes(lower) || 
      (c.description && c.description.toLowerCase().includes(lower))
    );
    setFilteredCategories(filtered);
  }, [searchText, categories]);

  const checkUser = async () => {
    try {
      const token = await getAuthCookie();
      if (!token) {
        message.error("Bạn chưa đăng nhập");
        router.push("/");
        return;
      }
      // Decode token để check role nếu cần thiết (như code cũ của bạn)
    } catch (error) {
      console.error("Error checking user:", error);
      router.push("/");
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await get_authors_and_categories();

      if (response.success) {
        // API trả về { categories: [...] }
        setCategories(response.data.categories || []);
      } else {
        message.error(response.message || 'Lỗi khi tải dữ liệu thể loại');
      }
    } catch (error) {
      message.error('Không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  // --- Modal Handlers ---
  const openAddModal = () => {
    setModalMode('add');
    setCurrentCategoryId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const openEditModal = (record: Category) => {
    setModalMode('edit');
    setCurrentCategoryId(record.category_id);
    form.setFieldsValue({
      category_name: record.category_name,
      description: record.description
    });
    setIsModalVisible(true);
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Chuẩn bị payload theo đúng yêu cầu backend (bọc trong datauser)
      const datauser = {
        category_name: values.category_name,
        description: values.description,
        category_id: currentCategoryId // Chỉ dùng cho edit
      };

      let response;
      if (modalMode === 'add') {
        // Backend yêu cầu { datauser: { ... } }
        response = await add_categories(datauser);
      } else {
        response = await edit_categories(datauser);
      }

      if (response.success) {
        message.success(modalMode === 'add' ? 'Thêm thể loại thành công' : 'Cập nhật thành công');
        setIsModalVisible(false);
        form.resetFields();
        fetchCategories(); // Refresh list
      } else {
        message.error(response.message || 'Thao tác thất bại');
      }
    } catch (error) {
      console.error('Validate or API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (record: Category) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa thể loại "${record.category_name}"?`,
      okText: 'Xóa ngay',
      okType: 'danger',
      cancelText: 'Hủy',
      centered: true,
      onOk: async () => {
        try {
          const response = await del_categories(record.category_id);

          if (response.success) {
            message.success('Xóa thể loại thành công');
            fetchCategories();
          } else {
            message.error(response.message || 'Xóa thất bại');
          }
        } catch (error) {
          console.error('Error deleting category:', error);
          message.error('Đã xảy ra lỗi hệ thống');
        }
      },
    });
  };

  // --- Table Configuration ---
  const columns: ColumnsType<Category> = [
    {
      title: 'Thể loại',
      dataIndex: 'category_name',
      key: 'category_name',
      sorter: (a, b) => a.category_name.localeCompare(b.category_name),
      render: (text, record) => (
        <div className="flex items-center gap-3">
            {/* Sử dụng Next/Image cho icon giả lập hoặc Avatar */}
            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
               {/* Do DB chưa có trường image, ta dùng một ảnh placeholder tĩnh
                  hoặc generate ảnh từ UI Avatars.
                  Dưới đây là ví dụ dùng Next Image với ảnh placeholder local hoặc remote
               */}
               <Image 
                 src={`https://ui-avatars.com/api/?name=${encodeURIComponent(text)}&background=random&color=fff&size=128`}
                 alt={text}
                 fill
                 sizes="40px"
                 className="object-cover"
               />
            </div>
            <div className="flex flex-col">
                <span className="font-semibold text-gray-800 text-base">{text}</span>
                <span className="text-xs text-gray-400">ID: {record.category_id}</span>
            </div>
        </div>
      )
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: '50%',
      render: (text) => (
        <span className="text-gray-500 line-clamp-2 text-sm">
          {text || <span className="italic text-gray-300">Không có mô tả</span>}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-end gap-2">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text" shape="circle" icon={<Edit size={16} className="text-indigo-600" />}
              className="bg-indigo-50 hover:bg-indigo-100 transition-colors"
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
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Quản lý Thể loại</h1>
            <p className="text-gray-500 mt-1 text-sm">Phân loại và tổ chức sách trong thư viện</p>
        </div>
        <div className="flex items-center gap-3">
             <div className="relative group">
                <Input 
                    placeholder="Tìm thể loại..." 
                    prefix={<Search size={16} className="text-gray-400 group-hover:text-pink-500 transition-colors" />}
                    className="w-64 rounded-full border-gray-200 hover:border-pink-400 focus:border-pink-500 shadow-sm"
                    onChange={(e) => setSearchText(e.target.value)}
                />
             </div>
             <Button 
                type="primary" icon={<Plus size={18} />} onClick={openAddModal}
                className="bg-gradient-to-r from-pink-500 to-rose-500 border-0 hover:shadow-lg h-10 px-6 rounded-full font-medium flex items-center gap-1 transition-all duration-300"
             >
                Thêm thể loại
             </Button>
        </div>
      </div>

      {/* --- Stats Cards (Trang trí) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Card bordered={false} className="rounded-xl shadow-sm bg-white border border-gray-100 p-0 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-50 rounded-lg text-pink-600"><LibraryBig size={24} /></div>
                <div>
                    <p className="text-gray-400 text-xs uppercase font-bold">Tổng số thể loại</p>
                    <h3 className="text-2xl font-bold text-gray-800">{categories.length}</h3>
                </div>
            </div>
         </Card>
         <Card bordered={false} className="rounded-xl shadow-sm bg-white border border-gray-100 p-0 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600"><LayoutList size={24} /></div>
                <div>
                    <p className="text-gray-400 text-xs uppercase font-bold">Có mô tả</p>
                    <h3 className="text-2xl font-bold text-gray-800">
                        {categories.filter(c => c.description).length}
                    </h3>
                </div>
            </div>
         </Card>
         <Card bordered={false} className="rounded-xl shadow-sm bg-white border border-gray-100 p-0 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 rounded-lg text-amber-600"><Bookmark size={24} /></div>
                <div>
                    <p className="text-gray-400 text-xs uppercase font-bold">Mới cập nhật</p>
                    <h3 className="text-base font-bold text-gray-800">Hôm nay</h3>
                </div>
            </div>
         </Card>
      </div>

      {/* --- Table --- */}
      <Card bordered={false} className="shadow-lg shadow-gray-200/50 rounded-2xl overflow-hidden" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredCategories}
          loading={loading}
          rowKey="category_id"
          pagination={{ 
            pageSize: 8, 
            className: "p-4",
            showTotal: (total) => <span className="text-gray-400">Tổng {total} thể loại</span>
          }}
          className="custom-table"
          locale={{ emptyText: <Empty description="Chưa có thể loại nào" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
        />
      </Card>

      {/* --- Add / Edit Modal --- */}
      <Modal
        title={
            <div className="flex items-center gap-2 text-gray-800 text-xl font-bold pb-2 border-b border-gray-100">
                {modalMode === 'add' ? (
                   <><Plus className="text-pink-600" size={24} /> Thêm thể loại mới</>
                ) : (
                   <><Edit className="text-pink-600" size={24} /> Chỉnh sửa thể loại</>
                )}
            </div>
        }
        open={isModalVisible}
        onOk={handleModalSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText={modalMode === 'add' ? "Thêm mới" : "Lưu thay đổi"}
        cancelText="Hủy bỏ"
        confirmLoading={loading}
        okButtonProps={{ 
            className: 'bg-pink-600 hover:bg-pink-500 border-pink-600 h-10 px-6 rounded-lg font-medium' 
        }}
        cancelButtonProps={{ 
            className: 'h-10 px-6 rounded-lg hover:text-pink-600 hover:border-pink-600' 
        }}
        centered
        width={500}
        className="rounded-2xl overflow-hidden"
      >
        <Form form={form} layout="vertical" className="pt-6">
          <Form.Item
            label={<span className="font-medium text-gray-700">Tên thể loại</span>}
            name="category_name"
            rules={[
                { required: true, message: 'Vui lòng nhập tên thể loại' },
                { max: 100, message: 'Tên quá dài (tối đa 100 ký tự)' }
            ]}
          >
            <Input 
                size="large" 
                placeholder="Ví dụ: Khoa học viễn tưởng, Tiểu thuyết..." 
                className="rounded-lg" 
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-gray-700">Mô tả</span>}
            name="description"
          >
            <Input.TextArea 
                rows={4} 
                placeholder="Mô tả chi tiết về thể loại này..." 
                className="rounded-lg" 
                showCount 
                maxLength={500} 
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}