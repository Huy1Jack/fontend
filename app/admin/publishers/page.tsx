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
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe 
} from 'lucide-react';
// Đảm bảo bạn đã export add_publishers từ file route của bạn
import { get_publishers, del_publishers, edit_publishers, add_publishers } from '@/app/sever/admin/route';
import type { ColumnsType } from 'antd/es/table';
import { getAuthCookie } from "@/app/sever/authcookie/route";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// --- Interface Definitions ---
interface Publisher {
  publisher_id: number;
  publisher_name: string;
  address: string;
  email: string;
  phone: string;
  logo?: string; // Dự phòng trường hợp sau này có logo
}

// --- Helper: Màu Avatar ngẫu nhiên theo tên ---
const getAvatarColor = (name: string) => {
  const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#eb2f96', '#10b981', '#6366f1'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function PublishersPage() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [filteredPublishers, setFilteredPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentPublisherId, setCurrentPublisherId] = useState<number | null>(null);
  
  const [form] = Form.useForm();
  const router = useRouter();

  // --- Initial Data Loading ---
  useEffect(() => {
    fetchPublishers();
    checkUser();
  }, []);

  // --- Search Filter Logic ---
  useEffect(() => {
    const lower = searchText.toLowerCase();
    const filtered = publishers.filter(p => 
      p.publisher_name.toLowerCase().includes(lower) || 
      p.email?.toLowerCase().includes(lower) ||
      p.phone?.includes(searchText)
    );
    setFilteredPublishers(filtered);
  }, [searchText, publishers]);

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
      router.push("/");
    }
  };

  const fetchPublishers = async () => {
    try {
      setLoading(true);
      const response = await get_publishers();
      if (response.success) {
        setPublishers(response.data || []);
      } else {
        message.error(response.message || 'Lỗi tải dữ liệu');
      }
    } catch (error) {
      message.error('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // --- Modal Handlers ---
  const openAddModal = () => {
    setModalMode('add');
    setCurrentPublisherId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const openEditModal = (record: Publisher) => {
    setModalMode('edit');
    setCurrentPublisherId(record.publisher_id);
    form.setFieldsValue({
      publisher_name: record.publisher_name,
      address: record.address,
      email: record.email,
      phone: record.phone
    });
    setIsModalVisible(true);
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const datauser = {
        ...values,
        publisher_id: currentPublisherId // Chỉ dùng khi edit, add sẽ bị bỏ qua ở backend hoặc không ảnh hưởng
      };

      let response;
      if (modalMode === 'add') {
        response = await add_publishers(datauser);
      } else {
        response = await edit_publishers(datauser);
      }

      if (response.success) {
        message.success(modalMode === 'add' ? 'Thêm mới thành công' : 'Cập nhật thành công');
        setIsModalVisible(false);
        form.resetFields();
        fetchPublishers();
      } else {
        message.error(response.message || 'Thao tác thất bại');
      }
    } catch (error) {
      console.error('Validate Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (record: Publisher) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa nhà xuất bản "${record.publisher_name}"?`,
      okText: 'Xóa ngay',
      okType: 'danger',
      cancelText: 'Hủy',
      centered: true,
      onOk: async () => {
        try {
          const response = await del_publishers({ publisher_id: record.publisher_id });
          if (response.success) {
            message.success('Đã xóa nhà xuất bản');
            fetchPublishers();
          } else {
            message.error(response.message || 'Xóa thất bại');
          }
        } catch (error) {
          message.error('Lỗi hệ thống');
        }
      },
    });
  };

  // --- Table Columns ---
  const columns: ColumnsType<Publisher> = [
    {
      title: 'Nhà xuất bản',
      dataIndex: 'publisher_name',
      key: 'publisher_name',
      sorter: (a, b) => a.publisher_name.localeCompare(b.publisher_name),
      render: (text, record) => (
        <div className="flex items-center gap-3">
           {/* Avatar generated from name or Next Image if logo exists */}
           {record.logo ? (
             <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
               <Image src={record.logo} alt={text} fill sizes="40px" className="object-cover" />
             </div>
           ) : (
             <Avatar 
                shape="square" 
                size="large" 
                style={{ backgroundColor: getAvatarColor(text), verticalAlign: 'middle' }}
                className="rounded-lg shadow-sm"
              >
                {text.charAt(0).toUpperCase()}
             </Avatar>
           )}
           <div className="flex flex-col">
             <span className="font-semibold text-gray-800 text-base">{text}</span>
             <span className="text-xs text-gray-400">ID: {record.publisher_id}</span>
           </div>
        </div>
      )
    },
    {
      title: 'Thông tin liên hệ',
      key: 'contact',
      width: 300,
      render: (_, record) => (
        <div className="flex flex-col gap-1.5">
          {record.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
              <Mail size={14} className="text-blue-400" />
              <a href={`mailto:${record.email}`}>{record.email}</a>
            </div>
          )}
          {record.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors">
              <Phone size={14} className="text-green-400" />
              <a href={`tel:${record.phone}`}>{record.phone}</a>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      render: (text) => (
        <div className="flex items-start gap-2 text-gray-600">
           <MapPin size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
           <span className="line-clamp-2 text-sm">{text}</span>
        </div>
      )
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
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Nhà Xuất Bản</h1>
            <p className="text-gray-500 mt-1 text-sm">Quản lý đối tác xuất bản và thông tin liên hệ</p>
        </div>
        <div className="flex items-center gap-3">
             <div className="relative group">
                <Input 
                    placeholder="Tìm tên, email, sđt..." 
                    prefix={<Search size={16} className="text-gray-400 group-hover:text-indigo-500 transition-colors" />}
                    className="w-64 rounded-full border-gray-200 hover:border-indigo-400 focus:border-indigo-500 shadow-sm"
                    onChange={(e) => setSearchText(e.target.value)}
                />
             </div>
             <Button 
                type="primary" icon={<Plus size={18} />} onClick={openAddModal}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 border-0 hover:shadow-lg h-10 px-6 rounded-full font-medium flex items-center gap-1 transition-all duration-300"
             >
                Thêm NXB
             </Button>
        </div>
      </div>

      {/* --- Stats Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Card bordered={false} className="rounded-xl shadow-sm bg-white border border-gray-100 p-0 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600"><Building2 size={24} /></div>
                <div>
                    <p className="text-gray-400 text-xs uppercase font-bold">Tổng số NXB</p>
                    <h3 className="text-2xl font-bold text-gray-800">{publishers.length}</h3>
                </div>
            </div>
         </Card>
         <Card bordered={false} className="rounded-xl shadow-sm bg-white border border-gray-100 p-0 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-lg text-green-600"><Phone size={24} /></div>
                <div>
                    <p className="text-gray-400 text-xs uppercase font-bold">Có số điện thoại</p>
                    <h3 className="text-2xl font-bold text-gray-800">{publishers.filter(p => p.phone).length}</h3>
                </div>
            </div>
         </Card>
         <Card bordered={false} className="rounded-xl shadow-sm bg-white border border-gray-100 p-0 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-50 rounded-lg text-orange-600"><Globe size={24} /></div>
                <div>
                    <p className="text-gray-400 text-xs uppercase font-bold">Có Email</p>
                    <h3 className="text-2xl font-bold text-gray-800">{publishers.filter(p => p.email).length}</h3>
                </div>
            </div>
         </Card>
      </div>

      {/* --- Table --- */}
      <Card bordered={false} className="shadow-lg shadow-gray-200/50 rounded-2xl overflow-hidden" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredPublishers}
          loading={loading}
          rowKey="publisher_id"
          pagination={{ pageSize: 8, className: "p-4" }}
          className="custom-table"
          locale={{ emptyText: <Empty description="Chưa có dữ liệu" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
        />
      </Card>

      {/* --- Add / Edit Modal --- */}
      <Modal
        title={
            <div className="flex items-center gap-2 text-gray-800 text-xl font-bold pb-2 border-b border-gray-100">
                {modalMode === 'add' ? (<><Plus className="text-blue-500" size={24} /> Thêm nhà xuất bản</>) : (<><Edit className="text-blue-500" size={24} /> Cập nhật thông tin</>)}
            </div>
        }
        open={isModalVisible}
        onOk={handleModalSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText={modalMode === 'add' ? "Thêm mới" : "Lưu thay đổi"}
        cancelText="Hủy bỏ"
        confirmLoading={loading}
        okButtonProps={{ className: 'bg-blue-600 hover:bg-blue-500 border-blue-600 h-10 px-6 rounded-lg font-medium' }}
        cancelButtonProps={{ className: 'h-10 px-6 rounded-lg hover:text-blue-600 hover:border-blue-600' }}
        centered
        width={600}
        className="rounded-2xl overflow-hidden"
      >
        <Form form={form} layout="vertical" className="pt-6">
          <Form.Item
            label={<span className="font-medium text-gray-700">Tên nhà xuất bản</span>}
            name="publisher_name"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhà xuất bản' }]}
          >
            <Input size="large" prefix={<Building2 size={16} className="text-gray-400" />} placeholder="Ví dụ: NXB Kim Đồng" className="rounded-lg" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
                label={<span className="font-medium text-gray-700">Email</span>}
                name="email"
                rules={[
                    { required: true, message: 'Vui lòng nhập email' }, 
                    { type: 'email', message: 'Email không hợp lệ' }
                ]}
            >
                <Input size="large" prefix={<Mail size={16} className="text-gray-400" />} placeholder="contact@example.com" className="rounded-lg" />
            </Form.Item>

            <Form.Item
                label={<span className="font-medium text-gray-700">Số điện thoại</span>}
                name="phone"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
                <Input size="large" prefix={<Phone size={16} className="text-gray-400" />} placeholder="0901xxxxxx" className="rounded-lg" />
            </Form.Item>
          </div>

          <Form.Item
            label={<span className="font-medium text-gray-700">Địa chỉ</span>}
            name="address"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input.TextArea rows={3} placeholder="Địa chỉ chi tiết..." className="rounded-lg" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}