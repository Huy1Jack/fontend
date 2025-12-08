"use client";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image"; // ✅ Sử dụng next/image theo yêu cầu
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
  Statistic,
  Row,
  Col,
  Avatar,
  Tooltip
} from "antd";
import {
  ReloadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
  BookOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import {
  get_borrow_return,
  get_user,
  get_book_admin,
  add_borrow_return,
  edit_borrow_return,
} from "@/app/actions/adminActions";
import { getAuthCookie } from "@/app/actions/authActions";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Search } = Input;
const { Option } = Select;

// --- Interface ---
interface BorrowReturn {
  borrow_id: number;
  user_name: string;
  book_title: string;
  borrow_date: string;
  return_date: string | null;
  due_date?: string | null; // Thêm due_date nếu backend có trả về
  status: string;
  last_updated_by?: string;
  user_avatar?: string; // Giả lập field ảnh
  book_cover?: string;  // Giả lập field ảnh
}

interface User {
  id: number;
  name: string;
  email?: string;
}

interface Book {
  books_id: number;
  Title: string;
  image?: string;
}

// Hàm giả lập ảnh bìa/avatar nếu không có dữ liệu thật (để demo next/image)
const getAvatarUrl = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;

export default function AdminBorrowReturn() {
  const router = useRouter();
  const [form] = Form.useForm();
  
  // Data State
  const [borrowList, setBorrowList] = useState<BorrowReturn[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter State
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BorrowReturn | null>(null);
  const [currentUser, setCurrentUser] = useState<string>("Không xác định");

  // --- API Calls ---
  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchBorrowReturn(), fetchUsers(), fetchBooks()]);
    setLoading(false);
  };

  const fetchBorrowReturn = async () => {
    try {
      const res = await get_borrow_return();
      if (res.success && res.data) setBorrowList(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchUsers = async () => {
    try {
      const res = await get_user();
      if (res.success && res.data) setUsers(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchBooks = async () => {
    try {
      const res = await get_book_admin();
      if (res.success && res.data) setBooks(res.data);
    } catch (e) { console.error(e); }
  };

  const checkUser = async () => {
    try {
      const token = await getAuthCookie();
      if (!token) {
        message.error("Bạn chưa đăng nhập");
        router.push("/");
        return;
      }
      const payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUser(payload.name || payload.email || "User");
      if (![1, 2].includes(payload.role)) {
        message.error("Không có quyền truy cập");
        router.push("/");
      }
    } catch { router.push("/"); }
  };

  useEffect(() => {
    checkUser();
    fetchAllData();
  }, []);

  // --- Logic Stats (Thống kê) ---
  const stats = useMemo(() => {
    return {
      total: borrowList.length,
      active: borrowList.filter(i => i.status === "Đang mượn").length,
      overdue: borrowList.filter(i => i.status === "Quá hạn").length,
      returned: borrowList.filter(i => i.status === "Đã trả").length,
    };
  }, [borrowList]);

  // --- Logic Filter ---
  const filteredList = borrowList.filter((item) => {
    const s = searchText.toLowerCase();
    const matchesSearch =
      item.book_title.toLowerCase().includes(s) ||
      item.user_name.toLowerCase().includes(s) ||
      (item.last_updated_by?.toLowerCase() || "").includes(s);
    
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;

    let matchesDate = true;
    if (filterDateRange && filterDateRange[0] && filterDateRange[1]) {
      const itemDate = dayjs(item.borrow_date);
      matchesDate = itemDate.isSameOrAfter(filterDateRange[0], "day") &&
                    itemDate.isSameOrBefore(filterDateRange[1], "day");
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // --- Handlers ---
  const handleAddOrEdit = (record?: BorrowReturn) => {
    if (record) {
      setEditingRecord(record);
      form.setFieldsValue({
        ...record,
        borrow_date: dayjs(record.borrow_date),
        return_date: record.return_date ? dayjs(record.return_date) : null,
        due_date: record.due_date ? dayjs(record.due_date) : null,
        last_updated_by: currentUser,
      });
    } else {
      setEditingRecord(null);
      form.resetFields();
      form.setFieldsValue({ 
        last_updated_by: currentUser,
        borrow_date: dayjs(), // Mặc định ngày hiện tại
        status: "Đang mượn"
      });
    }
    setIsModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const token = await getAuthCookie();

      // Chuẩn bị payload khớp với Python backend
      const payload = {
        user_name: values.user_name,
        book_title: values.book_title,
        borrow_date: values.borrow_date.format("YYYY-MM-DD"),
        due_date: values.due_date ? values.due_date.format("YYYY-MM-DD") : null,
        return_date: values.return_date ? values.return_date.format("YYYY-MM-DD") : null,
        status: values.status,
        last_updated_by: currentUser,
        token: token,
        api_key: "YOUR_API_KEY_HERE" // Lưu ý: Nên lấy từ biến môi trường
      };

      let res;
      if (editingRecord) {
        // Edit API cần borrow_id
        res = await edit_borrow_return({ ...payload, borrow_id: editingRecord.borrow_id });
      } else {
        res = await add_borrow_return(payload);
      }

      if (res.success) {
        message.success("Thao tác thành công!");
        setIsModalVisible(false);
        fetchBorrowReturn();
      } else {
        message.error(res.message || "Có lỗi xảy ra");
      }
    } catch (e) { console.error(e); }
  };

  // --- Columns Config ---
  const columns = [
    {
      title: "Người mượn",
      dataIndex: "user_name",
      key: "user_name",
      width: 200,
      render: (text: string) => (
        <div className="flex items-center gap-3">
          {/* ✅ Dùng next/image giả lập avatar */}
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200">
             <Image 
               src={getAvatarUrl(text)} 
               alt={text}
               fill
               sizes="32px"
               className="object-cover"
             />
          </div>
          <span className="font-medium text-gray-700">{text}</span>
        </div>
      ),
    },
    {
      title: "Thông tin sách",
      dataIndex: "book_title",
      key: "book_title",
      width: 300,
      render: (text: string) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <BookOutlined />
          </div>
          <span className="font-medium text-gray-800 line-clamp-1" title={text}>{text}</span>
        </div>
      ),
    },
    {
      title: "Thời gian",
      key: "time",
      width: 200,
      render: (_: any, record: BorrowReturn) => (
        <div className="flex flex-col text-sm">
          <span className="text-gray-500">Mượn: <span className="text-gray-800 font-medium">{dayjs(record.borrow_date).format("DD/MM/YYYY")}</span></span>
          {record.return_date ? (
            <span className="text-gray-500">Trả: <span className="text-gray-800 font-medium">{dayjs(record.return_date).format("DD/MM/YYYY")}</span></span>
          ) : (
             <span className="text-gray-400 italic">-- Chưa trả --</span>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status: string) => {
        let color = "processing";
        let icon = <ClockCircleOutlined />;
        if (status === "Đã trả") { color = "success"; icon = <CheckCircleOutlined />; }
        if (status === "Quá hạn") { color = "error"; icon = <WarningOutlined />; }
        
        return (
          <Tag color={color} icon={icon} className="px-3 py-1 rounded-full text-sm font-medium border-0">
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      width: 100,
      fixed: "right" as const,
      render: (_: any, record: BorrowReturn) => (
        <Tooltip title="Chỉnh sửa">
          <Button
            type="text"
            shape="circle"
            icon={<EditOutlined className="text-indigo-600" />}
            className="bg-indigo-50 hover:bg-indigo-100"
            onClick={() => handleAddOrEdit(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800 m-0">Quản lý Mượn - Trả</h1>
           <p className="text-gray-500 mt-1">Theo dõi hoạt động lưu thông tài liệu thư viện</p>
        </div>
        <div className="flex gap-2">
           <Button icon={<ReloadOutlined />} onClick={fetchAllData} className="border-gray-300 text-gray-600">Làm mới</Button>
           <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAddOrEdit()} className="bg-indigo-600 hover:bg-indigo-500 border-none shadow-md shadow-indigo-200">
             Mượn sách mới
           </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm rounded-xl border-l-4 border-l-blue-500">
            <Statistic title="Đang mượn" value={stats.active} valueStyle={{ color: '#3b82f6', fontWeight: 'bold' }} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm rounded-xl border-l-4 border-l-red-500">
            <Statistic title="Quá hạn" value={stats.overdue} valueStyle={{ color: '#ef4444', fontWeight: 'bold' }} prefix={<WarningOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm rounded-xl border-l-4 border-l-green-500">
            <Statistic title="Đã trả / Hoàn tất" value={stats.returned} valueStyle={{ color: '#10b981', fontWeight: 'bold' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card bordered={false} className="shadow-md rounded-xl overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 p-1">
          <Input 
            prefix={<SearchOutlined className="text-gray-400" />} 
            placeholder="Tìm sách, người mượn..." 
            className="md:w-1/3 rounded-lg py-2"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          <Select 
            defaultValue="all" 
            className="md:w-48 h-10" 
            onChange={setFilterStatus}
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "Đang mượn", label: "Đang mượn" },
              { value: "Quá hạn", label: "Quá hạn" },
              { value: "Đã trả", label: "Đã trả" },
            ]}
          />
          <DatePicker.RangePicker 
             className="md:w-1/3 h-10 rounded-lg" 
             format="DD/MM/YYYY"
             placeholder={['Từ ngày', 'Đến ngày']}
             onChange={(dates) => setFilterDateRange(dates)}
          />
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredList}
          rowKey="borrow_id"
          loading={loading}
          pagination={{ pageSize: 8, showTotal: (total) => `Tổng ${total} phiếu` }}
          scroll={{ x: 1000 }}
          className="custom-table"
        />
      </Card>

      {/* Modal Form */}
      <Modal
        title={
           <div className="flex items-center gap-2 text-indigo-700 text-lg">
              {editingRecord ? <EditOutlined /> : <PlusOutlined />}
              <span>{editingRecord ? "Cập nhật phiếu mượn" : "Tạo phiếu mượn mới"}</span>
           </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit}
        okText="Lưu phiếu"
        cancelText="Hủy bỏ"
        width={650}
        centered
        okButtonProps={{ className: "bg-indigo-600 hover:bg-indigo-500 border-none h-10 px-6" }}
        cancelButtonProps={{ className: "h-10 px-6 hover:text-indigo-600 hover:border-indigo-600" }}
      >
        <Form form={form} layout="vertical" className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6">
          
          <Form.Item label="Người mượn" name="user_name" rules={[{ required: true, message: "Vui lòng chọn người mượn" }]}>
             <Select 
                showSearch 
                placeholder="Tìm tên thành viên..." 
                optionFilterProp="children" 
                size="large"
                suffixIcon={<UserOutlined />}
             >
                {users.map(u => <Option key={u.id} value={u.name}>{u.name}</Option>)}
             </Select>
          </Form.Item>

          <Form.Item label="Sách mượn" name="book_title" rules={[{ required: true, message: "Vui lòng chọn sách" }]}>
             <Select 
                showSearch 
                placeholder="Tìm tên sách..." 
                optionFilterProp="children" 
                size="large"
                suffixIcon={<BookOutlined />}
             >
                {books.map(b => <Option key={b.books_id} value={b.Title}>{b.Title}</Option>)}
             </Select>
          </Form.Item>

          <Form.Item label="Ngày mượn" name="borrow_date" rules={[{ required: true }]}>
             <DatePicker className="w-full" size="large" format="DD/MM/YYYY" placeholder="Chọn ngày mượn" />
          </Form.Item>

          <Form.Item label="Hạn trả (Dự kiến)" name="due_date">
             <DatePicker className="w-full" size="large" format="DD/MM/YYYY" placeholder="Chọn hạn trả" />
          </Form.Item>

          <Form.Item label="Ngày trả thực tế" name="return_date">
             <DatePicker className="w-full" size="large" format="DD/MM/YYYY" placeholder="Chưa trả" allowClear />
          </Form.Item>

          <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
             <Select size="large">
                <Option value="Đang mượn"><Tag color="processing">Đang mượn</Tag></Option>
                <Option value="Đã trả"><Tag color="success">Đã trả</Tag></Option>
                <Option value="Quá hạn"><Tag color="error">Quá hạn</Tag></Option>
             </Select>
          </Form.Item>

          <div className="md:col-span-2">
             <Form.Item label="Người cập nhật cuối" name="last_updated_by">
                <Input disabled prefix={<UserOutlined className="text-gray-400" />} className="bg-gray-50 text-gray-500" />
             </Form.Item>
          </div>

        </Form>
      </Modal>
    </div>
  );
}