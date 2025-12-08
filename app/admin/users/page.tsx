"use client";
import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import {
  Button,
  Input,
  Form,
  Modal,
  message,
  Popconfirm,
  Card,
  Tag,
  Select,
  Statistic,
  Empty,
  Tooltip
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  DeleteOutlined,
  CalendarOutlined,
  UserSwitchOutlined,
  SearchOutlined,
  UserOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  EditOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import {
  get_user,
  edit_email_admin,
  edit_pass_admin,
  del_user_admin,
  edit_role_admin,
} from "@/app/sever/admin/route";
import { useRouter } from "next/navigation";
import { getAuthCookie } from "@/app/sever/authcookie/route";
import dayjs from "dayjs";

// --- Interfaces ---
interface User {
  id: number;
  name: string;
  email: string;
  role: number;
  created_at: string;
}

// --- Constants & Helpers ---
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "YOUR_API_KEY";

const getRoleConfig = (role: number) => {
  switch (role) {
    case 1:
      return { label: "Admin", color: "red", icon: <SafetyCertificateOutlined /> };
    case 2:
      return { label: "Cán bộ", color: "blue", icon: <CheckCircleOutlined /> };
    default:
      return { label: "Người dùng", color: "green", icon: <UserOutlined /> };
  }
};

const getAvatarUrl = (name: string) => 
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&bold=true`;

export default function UsersPage() {
  const router = useRouter();
  
  // --- State ---
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState<number | null>(null);

  // Modal States
  const [modalState, setModalState] = useState<{
    visible: boolean;
    type: 'email' | 'password' | 'role' | null;
    user: User | null;
  }>({ visible: false, type: null, user: null });

  const [form] = Form.useForm();

  // --- Effects ---
  useEffect(() => {
    checkAuth();
    fetchUsers();
  }, []);

  // --- Logic ---
  const checkAuth = async () => {
    try {
      const token = await getAuthCookie();
      if (!token) {
        router.push("/");
        return;
      }
      const payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserRole(payload.role);
      
      if (![1, 2].includes(payload.role)) {
        message.error("Không có quyền truy cập");
        router.push("/");
      }
    } catch {
      router.push("/");
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await get_user();
      if (res.success) setUsers(res.data || []);
      else message.error(res.message);
    } catch (e) {
      console.error(e);
      message.error("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  // --- Filter & Stats ---
  const filteredUsers = useMemo(() => {
    const s = searchText.toLowerCase();
    return users.filter(u => 
      u.name.toLowerCase().includes(s) || 
      u.email.toLowerCase().includes(s)
    );
  }, [users, searchText]);

  const stats = useMemo(() => ({
    total: users.length,
    admin: users.filter(u => u.role === 1).length,
    staff: users.filter(u => u.role === 2).length,
    user: users.filter(u => u.role === 3).length,
  }), [users]);

  // --- Actions ---
  const handleOpenModal = (type: 'email' | 'password' | 'role', user: User) => {
    if (currentUserRole !== 1 && (type === 'role' || type === 'email' || type === 'password')) {
       message.warning("Chỉ Admin mới có quyền thực hiện thao tác này");
       return;
    }
    
    setModalState({ visible: true, type, user });
    form.resetFields();
    
    if (type === 'role') form.setFieldValue('newRole', user.role);
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      const token = await getAuthCookie();
      const targetUser = modalState.user;
      
      if (!targetUser || !token) return;

      let res;
      if (modalState.type === 'password') {
        const payload = {
            token,
            api_key: API_KEY,
            datauser: { email: targetUser.email, newPassword: values.newPassword }
        };
        res = await edit_pass_admin(payload);
      }
      else if (modalState.type === 'email') {
         const payload = {
            token,
            api_key: API_KEY,
            datauser: { oldEmail: targetUser.email, newEmail: values.newEmail }
         };
         res = await edit_email_admin(payload);
      }
      else if (modalState.type === 'role') {
         const payload = {
            token,
            api_key: API_KEY,
            datauser: { email: targetUser.email, newRole: values.newRole }
         };
         res = await edit_role_admin(payload);
      }

      if (res && res.success) {
        message.success(res.message || "Thao tác thành công");
        setModalState({ visible: false, type: null, user: null });
        fetchUsers();
      } else {
        message.error(res?.message || "Thao tác thất bại");
      }

    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (user: User) => {
    if (currentUserRole !== 1) {
        message.warning("Chỉ Admin mới có quyền xóa tài khoản");
        return;
    }
    try {
        const res = await del_user_admin({ email: user.email });
        if (res.success) {
            message.success("Đã xóa người dùng");
            fetchUsers();
        } else {
            message.error(res.message);
        }
    } catch { message.error("Lỗi hệ thống"); }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-8">
      
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Quản lý Tài khoản</h1>
            <p className="text-gray-500 mt-1 text-sm">Quản lý quyền truy cập và thông tin người dùng hệ thống</p>
        </div>
        <div className="relative group w-full md:w-auto">
            <Input 
                prefix={<SearchOutlined className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />}
                placeholder="Tìm tên hoặc email..." 
                className="w-full md:w-72 rounded-full border-gray-200 hover:border-indigo-400 focus:border-indigo-500 shadow-sm py-2 px-4"
                onChange={(e) => setSearchText(e.target.value)}
            />
        </div>
      </div>

      {/* --- Stats Cards --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <Card bordered={false} className="rounded-2xl shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <Statistic title={<span className="text-indigo-100">Tổng tài khoản</span>} value={stats.total} valueStyle={{ color: 'white', fontWeight: 'bold' }} prefix={<TeamOutlined />} />
         </Card>
         <Card bordered={false} className="rounded-2xl shadow-sm bg-white hover:shadow-md transition-shadow">
            <Statistic title="Quản trị viên (Admin)" value={stats.admin} valueStyle={{ color: '#ef4444', fontWeight: 'bold' }} prefix={<SafetyCertificateOutlined />} />
         </Card>
         <Card bordered={false} className="rounded-2xl shadow-sm bg-white hover:shadow-md transition-shadow">
            <Statistic title="Cán bộ (Staff)" value={stats.staff} valueStyle={{ color: '#3b82f6', fontWeight: 'bold' }} prefix={<CheckCircleOutlined />} />
         </Card>
         <Card bordered={false} className="rounded-2xl shadow-sm bg-white hover:shadow-md transition-shadow">
            <Statistic title="Người dùng (User)" value={stats.user} valueStyle={{ color: '#22c55e', fontWeight: 'bold' }} prefix={<UserOutlined />} />
         </Card>
      </div>

      {/* --- User Grid --- */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <Empty description="Không tìm thấy người dùng nào" className="mt-12" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {filteredUsers.map((user) => {
                const roleConf = getRoleConfig(user.role);
                // Biến kiểm tra Admin để disable nút
                const isAdmin = user.role === 1;

                return (
                    <div key={user.id} className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                        {/* Role Badge */}
                        <div className="absolute top-4 right-4">
                            <Tag color={roleConf.color} icon={roleConf.icon} className="mr-0 rounded-full px-3 py-0.5 border-0 font-medium">
                                {roleConf.label}
                            </Tag>
                        </div>

                        {/* Avatar & Basic Info */}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md">
                                <Image src={getAvatarUrl(user.name)} alt={user.name} fill className="object-cover" sizes="56px"/>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg line-clamp-1" title={user.name}>{user.name}</h3>
                                <div className="flex items-center text-xs text-gray-400 gap-1">
                                    <CalendarOutlined />
                                    <span>{dayjs(user.created_at).format("DD/MM/YYYY")}</span>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100">
                             <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                                <MailOutlined className="text-indigo-400" />
                                <span className="truncate" title={user.email}>{user.email}</span>
                             </div>
                             <div className="flex items-center gap-2 text-gray-500 text-xs">
                                <SafetyCertificateOutlined className="text-gray-400" />
                                <span>ID: {user.id}</span>
                             </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-50">
                            {/* Nút Đổi Quyền: Hiện nhưng Disabled nếu là Admin */}
                            <Tooltip title={isAdmin ? "Không thể đổi quyền Admin" : "Đổi Quyền"}>
                                <Button 
                                    block type="text" 
                                    // Đổi màu icon thành xám nếu disabled
                                    icon={<UserSwitchOutlined className={isAdmin ? "text-gray-400" : "text-orange-500"} />} 
                                    // Đổi background thành xám nhẹ nếu disabled
                                    className={`rounded-lg ${isAdmin ? "bg-gray-100 cursor-not-allowed" : "bg-orange-50 hover:bg-orange-100"}`}
                                    onClick={() => handleOpenModal('role', user)}
                                    disabled={isAdmin} // Disable logic giống nút Xóa
                                />
                            </Tooltip>
                            
                            <Tooltip title="Đổi Email">
                                <Button 
                                    block type="text" 
                                    icon={<EditOutlined className="text-blue-500" />} 
                                    className="bg-blue-50 hover:bg-blue-100 rounded-lg"
                                    onClick={() => handleOpenModal('email', user)}
                                />
                            </Tooltip>
                            <Tooltip title="Đổi Mật khẩu">
                                <Button 
                                    block type="text" 
                                    icon={<LockOutlined className="text-indigo-500" />} 
                                    className="bg-indigo-50 hover:bg-indigo-100 rounded-lg"
                                    onClick={() => handleOpenModal('password', user)}
                                />
                            </Tooltip>
                            <Tooltip title={isAdmin ? "Không thể xóa Admin" : "Xóa Tài khoản"}>
                                <Popconfirm
                                    title="Xóa tài khoản?"
                                    description={`Bạn chắc chắn muốn xóa ${user.name}?`}
                                    onConfirm={() => handleDelete(user)}
                                    okText="Xóa"
                                    okType="danger"
                                    cancelText="Hủy"
                                    disabled={isAdmin}
                                >
                                    <Button 
                                        block type="text" danger 
                                        icon={<DeleteOutlined className={isAdmin ? "text-gray-400" : "text-red-500"} />} 
                                        className={`rounded-lg ${isAdmin ? "bg-gray-100 cursor-not-allowed" : "bg-red-50 hover:bg-red-100"}`}
                                        disabled={isAdmin}
                                    />
                                </Popconfirm>
                            </Tooltip>
                        </div>
                    </div>
                );
            })}
        </div>
      )}

      {/* --- Universal Modal --- */}
      <Modal
        title={
            <div className="flex items-center gap-2 text-xl font-bold text-gray-800 pb-2 border-b border-gray-100">
               {modalState.type === 'role' && <><UserSwitchOutlined className="text-orange-500" /> Phân quyền người dùng</>}
               {modalState.type === 'email' && <><MailOutlined className="text-blue-500" /> Thay đổi Email</>}
               {modalState.type === 'password' && <><LockOutlined className="text-indigo-500" /> Đặt lại mật khẩu</>}
            </div>
        }
        open={modalState.visible}
        onCancel={() => setModalState({ ...modalState, visible: false })}
        onOk={handleModalSubmit}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        centered
        okButtonProps={{ className: "bg-indigo-600 hover:bg-indigo-500 border-none h-10 px-6 rounded-lg" }}
        cancelButtonProps={{ className: "h-10 px-6 rounded-lg hover:text-indigo-600 hover:border-indigo-600" }}
      >
         <Form form={form} layout="vertical" className="pt-4">
             {modalState.user && (
                 <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-3">
                     <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        <Image src={getAvatarUrl(modalState.user.name)} alt="avt" fill className="object-cover" />
                     </div>
                     <div>
                         <div className="font-bold text-gray-800">{modalState.user.name}</div>
                         <div className="text-xs text-gray-500">{modalState.user.email}</div>
                     </div>
                 </div>
             )}

             {/* Form chọn quyền: Vẫn giữ Option Admin (Value=1) nếu muốn hiển thị đủ, 
                 nhưng logic frontend đã chặn Admin mở modal này rồi nên thực tế ít khi dùng đến.
                 Nếu bạn muốn an toàn hơn khi sửa cho User thường, có thể ẩn Option Admin đi. 
                 Dưới đây tôi ẩn Option Admin để tránh User thường bị nâng quyền thành Admin nhầm lẫn. */}
             {modalState.type === 'role' && (
                 <Form.Item name="newRole" label="Vai trò mới" rules={[{ required: true }]}>
                     <Select size="large" className="w-full">
                         {/* Option Admin đã bị xóa để an toàn */}
                         <Select.Option value={2}><span className="text-blue-500 font-medium">Cán bộ </span></Select.Option>
                         <Select.Option value={3}><span className="text-green-500 font-medium">Người dùng</span></Select.Option>
                     </Select>
                 </Form.Item>
             )}

             {modalState.type === 'email' && (
                 <Form.Item name="newEmail" label="Địa chỉ Email mới" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
                     <Input size="large" prefix={<MailOutlined className="text-gray-400" />} placeholder="nhap_email_moi@example.com" />
                 </Form.Item>
             )}

             {modalState.type === 'password' && (
                 <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true, min: 6, message: 'Tối thiểu 6 ký tự' }]}>
                     <Input.Password size="large" prefix={<LockOutlined className="text-gray-400" />} placeholder="Nhập mật khẩu mới..." />
                 </Form.Item>
             )}
         </Form>
      </Modal>
    </div>
  );
}