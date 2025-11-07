"use client";
import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Space,
  Input,
  Select,
  Button,
  Tag,
  Modal,
  Form,
  DatePicker,
  message,
  Input as AntInput,
} from "antd";
import {
  ReloadOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  get_borrow_return,
  get_user,
  get_book_admin,
  add_borrow_return,
  edit_borrow_return,
} from "@/app/sever/admin/route";
import dayjs from "dayjs";
import { getAuthCookie } from "@/app/sever/authcookie/route";

const { Search } = Input;
const { Option } = Select;

interface BorrowReturn {
  borrow_id: number;
  user_name: string;
  book_title: string;
  borrow_date: string;
  return_date: string | null;
  status: string;
  last_updated_by?: string; // Tên người chỉnh sửa
}

interface User {
  id: number;
  name: string;
}

interface Book {
  books_id: number;
  Title: string;
}

export default function AdminBorrowReturn() {
  const [borrowList, setBorrowList] = useState<BorrowReturn[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BorrowReturn | null>(null);
  const [currentUser, setCurrentUser] = useState<string>("Không xác định");
  const [form] = Form.useForm();

  // ✅ Lấy danh sách mượn - trả
  const fetchBorrowReturn = async () => {
    try {
      setLoading(true);
      const res = await get_borrow_return();
      if (res.success && res.data) {
        // Debug check để thấy last_updated_by
        console.log("Danh sách mượn-trả:", res.data);
        setBorrowList(res.data);
      } else {
        message.error(res.message || "Không thể tải danh sách mượn trả");
      }
    } catch (error: any) {
      console.error("Error fetching borrow_return:", error);
      message.error("Lỗi khi tải danh sách mượn trả");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Lấy danh sách người dùng
  const fetchUsers = async () => {
    try {
      const res = await get_user();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // ✅ Lấy danh sách sách
  const fetchBooks = async () => {
    try {
      const res = await get_book_admin();
      if (res.success && res.data) {
        setBooks(res.data);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  // ✅ Lấy người đang đăng nhập
  const fetchCurrentUser = async () => {
    try {
      const token = await getAuthCookie();
      const payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUser(payload.name || payload.email || "Không xác định");
    } catch {
      setCurrentUser("Không xác định");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchBooks();
    fetchCurrentUser();
    fetchBorrowReturn();
  }, []);

  // ✅ Mở modal thêm/sửa
  const handleAddOrEdit = (record?: BorrowReturn) => {
    if (record) {
      setEditingRecord(record);
      form.setFieldsValue({
        ...record,
        borrow_date: dayjs(record.borrow_date),
        return_date: record.return_date ? dayjs(record.return_date) : null,
        last_updated_by: currentUser,
      });
    } else {
      setEditingRecord(null);
      form.resetFields();
      form.setFieldsValue({ last_updated_by: currentUser });
    }
    setIsModalVisible(true);
  };

  // ✅ Gọi API thêm hoặc sửa
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const token = await getAuthCookie();

      const payload = {
        user_name: values.user_name,
        book_title: values.book_title,
        borrow_date: values.borrow_date.format("YYYY-MM-DD"),
        return_date: values.return_date
          ? values.return_date.format("YYYY-MM-DD")
          : null,
        status: values.status,
        last_updated_by: currentUser, // ✅ gửi tên người chỉnh sửa
        token: token,
      };

      let res;
      if (editingRecord) {
        payload["borrow_id"] = editingRecord.borrow_id;
        res = await edit_borrow_return(payload);
      } else {
        res = await add_borrow_return(payload);
      }

      if (res.success) {
        message.success(res.message || "Thao tác thành công!");
        setIsModalVisible(false);
        fetchBorrowReturn();
      } else {
        message.error(res.message || "Thao tác thất bại!");
      }
    } catch (error) {
      console.error(error);
      message.error("Vui lòng nhập đầy đủ thông tin hợp lệ.");
    }
  };

  // ✅ Bộ lọc tìm kiếm
  const filteredList = borrowList.filter((item) => {
    const s = searchText.toLowerCase();
    const matchesSearch =
      item.book_title.toLowerCase().includes(s) ||
      item.user_name.toLowerCase().includes(s) ||
      item.status.toLowerCase().includes(s) ||
      (item.last_updated_by?.toLowerCase() || "").includes(s);
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // ✅ Cột hiển thị bảng
  const columns = [
    { title: "Người mượn", dataIndex: "user_name", key: "user_name", width: 150 },
    { title: "Tên sách", dataIndex: "book_title", key: "book_title", width: 250 },
    {
      title: "Ngày mượn",
      dataIndex: "borrow_date",
      key: "borrow_date",
      width: 120,
      render: (d: string) =>
        new Date(d).toLocaleDateString("vi-VN", { dateStyle: "medium" }),
    },
    {
      title: "Ngày trả",
      dataIndex: "return_date",
      key: "return_date",
      width: 120,
      render: (d: string | null) =>
        d ? new Date(d).toLocaleDateString("vi-VN", { dateStyle: "medium" }) : "-",
    },
    {
      title: "Người chỉnh sửa",
      dataIndex: "last_updated_by",
      key: "last_updated_by",
      width: 200,
      render: (text: string) => text || "(Chưa cập nhật)",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: string) => {
        let color = "blue";
        let icon = <ClockCircleOutlined />;
        if (status === "Đã trả") {
          color = "green";
          icon = <CheckOutlined />;
        } else if (status === "Quá hạn") {
          color = "red";
          icon = <ExclamationCircleOutlined />;
        }
        return (
          <Tag color={color} icon={icon}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      width: 100,
      render: (_: any, record: BorrowReturn) => (
        <Button
          icon={<EditOutlined />}
          type="primary"
          onClick={() => handleAddOrEdit(record)}
        >
          Sửa
        </Button>
      ),
    },
  ];

  return (
    <Card
      title="📚 QUẢN LÝ MƯỢN - TRẢ SÁCH"
      extra={
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleAddOrEdit()}
          >
            Thêm mượn sách
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchBorrowReturn}>
            Làm mới
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: "100%", marginBottom: 16 }}>
        <Space wrap>
          <Search
            placeholder="Tìm kiếm sách, người mượn hoặc người chỉnh sửa..."
            allowClear
            style={{ width: 350 }}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            style={{ width: 200 }}
            placeholder="Lọc theo trạng thái"
            defaultValue="all"
            onChange={(value) => setFilterStatus(value)}
          >
            <Option value="all">Tất cả</Option>
            <Option value="Đang mượn">Đang mượn</Option>
            <Option value="Đã trả">Đã trả</Option>
            <Option value="Quá hạn">Quá hạn</Option>
          </Select>
        </Space>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredList}
        rowKey="borrow_id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} lượt mượn/trả`,
        }}
        scroll={{ x: 1200 }}
      />

      {/* Modal thêm/sửa */}
      <Modal
        title={editingRecord ? "Sửa thông tin mượn sách" : "Thêm người mượn sách"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Người mượn"
            name="user_name"
            rules={[{ required: true, message: "Chọn người mượn!" }]}
          >
            <Select placeholder="Chọn người mượn" showSearch optionFilterProp="children">
              {users.map((u) => (
                <Option key={u.id} value={u.name}>
                  {u.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Tên sách"
            name="book_title"
            rules={[{ required: true, message: "Chọn sách!" }]}
          >
            <Select placeholder="Chọn tên sách" showSearch optionFilterProp="children">
              {books.map((b) => (
                <Option key={b.books_id} value={b.Title}>
                  {b.Title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Ngày mượn"
            name="borrow_date"
            rules={[{ required: true, message: "Chọn ngày mượn!" }]}
          >
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item label="Ngày trả" name="return_date">
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item label="Người chỉnh sửa" name="last_updated_by">
            <AntInput disabled />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            initialValue="Đang mượn"
            rules={[{ required: true, message: "Chọn trạng thái!" }]}
          >
            <Select>
              <Option value="Đang mượn">Đang mượn</Option>
              <Option value="Đã trả">Đã trả</Option>
              <Option value="Quá hạn">Quá hạn</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
