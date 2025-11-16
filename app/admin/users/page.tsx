"use client";
import { useEffect, useState } from "react";
// ▼▼▼ THÊM MỚI/THAY ĐỔI IMPORT ▼▼▼
import {
  Space,
  Button,
  Input,
  Form,
  Modal,
  message,
  Popconfirm,
  List, // <--- THÊM MỚI
  Card, // <--- THÊM MỚI
  Avatar, // <--- THÊM MỚI
  Tag, // <--- THÊM MỚI
  Row, // <--- THÊM MỚI
  Col, // <--- THÊM MỚI
  Select, // <--- THÊM MỚI
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  DeleteOutlined,
  CalendarOutlined, // <--- THÊM MỚI
  UserSwitchOutlined, // <--- THÊM MỚI
} from "@ant-design/icons";
// ▲▲▲ THÊM MỚI/THAY ĐỔI IMPORT ▲▲▲
import {
  get_user,
  edit_email_admin,
  edit_pass_admin,
  del_user_admin,
  edit_role_admin, // <--- THÊM MỚI
} from "@/app/sever/admin/route";
import { useRouter } from "next/navigation";
// import type { ColumnsType } from 'antd/es/table'; // <--- KHÔNG CẦN NỮA
import { getAuthCookie } from "@/app/sever/authcookie/route";

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
  const [roleModalVisible, setRoleModalVisible] = useState(false); // <--- THÊM MỚI
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [emailForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [roleForm] = Form.useForm(); // <--- THÊM MỚI
  const router = useRouter();

  // ▼▼▼ THÊM MỚI STATE CHO TÌM KIẾM VÀ QUYỀN USER ▼▼▼
  const [searchText, setSearchText] = useState("");
  const [userRole, setUserRole] = useState<number | null>(null); // <--- THÊM MỚI
  // ▲▲▲ THÊM MỚI STATE CHO TÌM KIẾM VÀ QUYỀN USER ▲▲▲

  useEffect(() => {
    fetchUsers();
    Check_user();
  }, []);

  const Check_user = async () => {
    try {
      const token = await getAuthCookie();
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserRole(payload.role); // <--- LƯU QUYỀN USER
      if (payload.role == 1 || payload.role == 2) {
      } else {
        message.error("Bạn không có quyền truy cập trang này");
        router.push("/");
      }
    } catch (error: any) {
      message.error("Máy chủ không phản hồi");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await get_user();
      if (response.success) {
        setUsers(response.data);
      } else {
        message.error(response.message || "Không thể tải danh sách người dùng");
      }
    } catch (error) {
      message.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (values: { newPassword: string }) => {
    if (!currentUser) return;

    if (values.newPassword === currentUser.email) {
      message.error("Mật khẩu không được trùng với email vì lý do bảo mật!");
      return;
    }

    try {
      const response = await edit_pass_admin({
        email: currentUser.email,
        newPassword: values.newPassword,
      });
      if (response.success) {
        message.success("Cập nhật mật khẩu thành công");
        setPasswordModalVisible(false);
        passwordForm.resetFields();
      } else {
        message.error(response.message || "Cập nhật mật khẩu thất bại");
      }
    } catch (error) {
      message.error("Cập nhật mật khẩu thất bại");
    }
  };

  // Handle email change
  const handleEmailChange = async (values: { newEmail: string }) => {
    if (!currentUser) return;

    if (values.newEmail === currentUser.email) {
      message.error("Email mới không được trùng với email cũ!");
      return;
    }

    try {
      const response = await edit_email_admin({
        oldEmail: currentUser.email,
        newEmail: values.newEmail,
      });

      if (response.success) {
        message.success("Cập nhật email thành công");
        fetchUsers();
        setEmailModalVisible(false);
        emailForm.resetFields();
      } else {
        message.error(response.message || "Cập nhật email thất bại");
      }
    } catch (error) {
      message.error("Cập nhật email thất bại");
    }
  };

  // ▼▼▼ THÊM MỚI: HANDLE ROLE CHANGE ▼▼▼
  const handleRoleChange = async (values: { newRole: number }) => {
    if (!currentUser) return;

    try {
      const response = await edit_role_admin({
        email: currentUser.email,
        newRole: values.newRole,
      });

      if (response.success) {
        message.success("Cập nhật quyền thành công");
        fetchUsers(); // Tải lại danh sách để cập nhật giao diện
        setRoleModalVisible(false);
        roleForm.resetFields();
      } else {
        message.error(response.message || "Cập nhật quyền thất bại");
      }
    } catch (error) {
      message.error("Cập nhật quyền thất bại");
    }
  };
  // ▲▲▲ THÊM MỚI: HANDLE ROLE CHANGE ▲▲▲

  // Handle user deletion
  const handleDelete = async (user: User) => {
    try {
      const response = await del_user_admin({ email: user.email });
      if (response.success) {
        message.success("Xóa tài khoản thành công");
        fetchUsers();
      } else {
        message.error(response.message || "Xóa tài khoản thất bại");
      }
    } catch (error) {
      message.error("Xóa tài khoản thất bại");
    }
  };

  // ▼▼▼ CẬP NHẬT TÊN VAI TRÒ ▼▼▼
  const getRoleName = (role: number) => {
    switch (role) {
      case 1:
        return "Admin";
      case 2:
        return "Cán bộ"; // <-- Đã đổi từ 'Staff'
      case 3:
        return "Người dùng";
      default:
        return "Unknown";
    }
  };
  // ▲▲▲ CẬP NHẬT TÊN VAI TRÒ ▲▲▲

  // ▼▼▼ THÊM MỚI CÁC HÀM HỖ TRỢ CHO CARD ▼▼▼
  const getRoleColor = (role: number) => {
    switch (role) {
      case 1:
        return "red";
      case 2:
        return "blue";
      case 3:
        return "green";
      default:
        return "default";
    }
  };

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "#f56a00",
      "#7265e6",
      "#ffbf00",
      "#00a2ae",
      "#1890ff",
      "#f5222d",
    ];
    let hash = 0;
    if (name.length === 0) return colors[0];
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Lọc người dùng dựa trên searchText
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase())
  );
  // ▲▲▲ THÊM MỚI CÁC HÀM HỖ TRỢ CHO CARD ▲▲▲

  // ▼▼▼ THÊM MỚI: HÀM MỞ MODAL ĐỔI QUYỀN (CÓ KIỂM TRA) ▼▼▼
  const showRoleModal = (user: User) => {
    if (userRole !== 1) {
      message.error("Bạn không có quyền thay đổi quyền của người dùng khác.");
      return;
    }
    setCurrentUser(user);
    setRoleModalVisible(true);
    roleForm.setFieldsValue({ newRole: user.role }); // Set giá trị ban đầu
  };
  // ▲▲▲ THÊM MỚI: HÀM MỞ MODAL ĐỔI QUYỀN (CÓ KIỂM TRA) ▲▲▲

  // ▼▼▼ ►►► THAY ĐỔI TOÀN BỘ GIAO DIỆN HIỂN THỊ (RETURN) ◄◄◄ ▼▼▼
  return (
    <div className="p-6 bg-background text-foreground" style={{ minHeight: "100vh" }}>
      <h1 className="text-2xl font-bold mb-6 text-center">
        Quản lý Người dùng ({filteredUsers.length})
      </h1>

      {/* Thanh tìm kiếm */}
      <Row justify="center" className="mb-6">
        <Col xs={24} sm={20} md={16} lg={12}>
          <Input.Search
            placeholder="Tìm kiếm theo Tên, Email..."
            allowClear
            enterButton="Tìm kiếm"
            size="large"
            onSearch={(value) => setSearchText(value)}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Col>
      </Row>

      {/* Danh sách Card người dùng */}
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 2,
          lg: 3,
          xl: 3,
          xxl: 3,
        }}
        dataSource={filteredUsers}
        loading={loading}
        pagination={{
          pageSize: 9, // Hiển thị 9 card mỗi trang
          showTotal: (total) => `Tổng số: ${total} tài khoản`,
          align: "center",
          style: { marginTop: 24 },
        }}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              className="border-border"
              actions={[
                item.role !== 1 && (
                  <Button
                    type="text"
                    icon={<UserSwitchOutlined />}
                    onClick={() => showRoleModal(item)}
                  >
                    Đổi quyền
                  </Button>
                ),
                <Button
                  type="text"
                  icon={<MailOutlined />}
                  onClick={() => {
                    setCurrentUser(item);
                    setEmailModalVisible(true);
                    emailForm.resetFields();
                  }}
                >
                  Đổi Email
                </Button>,
                <Button
                  type="text"
                  icon={<LockOutlined />}
                  onClick={() => {
                    setCurrentUser(item);
                    setPasswordModalVisible(true);
                    passwordForm.resetFields();
                  }}
                >
                  Đổi mật khẩu
                </Button>,
                <Popconfirm
                  title="Xóa tài khoản"
                  description={`Bạn có chắc chắn muốn xóa tài khoản "${item.name}" (${item.email})?`}
                  onConfirm={() => handleDelete(item)}
                  okText="Có"
                  cancelText="Không"
                  okButtonProps={{ danger: true }}
                >
                  <Button type="text" danger icon={<DeleteOutlined />}>
                    Xóa
                  </Button>
                </Popconfirm>,
              ].filter(Boolean)}
            >
              <Card.Meta
                avatar={
                  <Avatar
                    style={{
                      backgroundColor: getAvatarColor(item.name),
                      verticalAlign: "middle",
                    }}
                    size="large"
                  >
                    {getInitial(item.name)}
                  </Avatar>
                }
                title={
                  <Space>
                    <span className="font-bold text-base text-foreground">
                      {item.name}
                    </span>
                    <Tag color={getRoleColor(item.role)}>
                      {getRoleName(item.role)}
                    </Tag>
                  </Space>
                }
              />
              <div className="mt-5 pl-1">
                <p className="flex items-center text-muted-foreground">
                  <MailOutlined className="mr-2" />
                  {item.email}
                </p>
                <p className="flex items-center text-muted-foreground">
                  <CalendarOutlined className="mr-2" />
                  Ngày tạo: {new Date(item.created_at).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </Card>
          </List.Item>
        )}
      />

      {/* Role Change Modal */}
      <Modal
        title="Đổi quyền người dùng"
        open={roleModalVisible}
        onCancel={() => {
          setRoleModalVisible(false);
          roleForm.resetFields();
        }}
        footer={null}
      >
        {currentUser && (
          <div className="mb-4">
            <p>
              <strong>Tài khoản:</strong> {currentUser.name}
            </p>
            <p>
              <strong>Email:</strong> {currentUser.email}
            </p>
            <p>
              <strong>Quyền hiện tại:</strong> {getRoleName(currentUser.role)}
            </p>
          </div>
        )}
        <Form form={roleForm} layout="vertical" onFinish={handleRoleChange}>
          <Form.Item
            name="newRole"
            label="Quyền mới"
            rules={[{ required: true, message: "Vui lòng chọn quyền mới!" }]}
          >
            <Select placeholder="Chọn quyền mới">
              <Select.Option value={2}>Cán bộ</Select.Option>
              <Select.Option value={3}>Người dùng</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
              <Button
                onClick={() => {
                  setRoleModalVisible(false);
                  roleForm.resetFields();
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Email Change Modal (Giữ nguyên) */}
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
            <p>
              <strong>Tài khoản:</strong> {currentUser.name}
            </p>
            <p>
              <strong>Email hiện tại:</strong> {currentUser.email}
            </p>
          </div>
        )}
        <Form form={emailForm} layout="vertical" onFinish={handleEmailChange}>
          <Form.Item
            name="newEmail"
            label="Email mới"
            rules={[
              { required: true, message: "Vui lòng nhập email mới!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input placeholder="Nhập email mới" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
              <Button
                onClick={() => {
                  setEmailModalVisible(false);
                  emailForm.resetFields();
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Password Change Modal (Giữ nguyên) */}
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
            <p>
              <strong>Tài khoản:</strong> {currentUser.name}
            </p>
            <p>
              <strong>Email:</strong> {currentUser.email}
            </p>
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
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
              <Button
                onClick={() => {
                  setPasswordModalVisible(false);
                  passwordForm.resetFields();
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}