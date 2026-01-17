"use client";
import { useEffect, useState, useMemo } from "react";
import {
  Table,
  Card,
  Input,
  Select,
  Button,
  Tag,
  message,
  Statistic,
  Row,
  Col,
  Empty,
  Spin,
  Modal,
  Form,
  DatePicker,
  Tooltip
} from "antd";
import {
  ReloadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  SearchOutlined,
  BookOutlined,
  CalendarOutlined,
  HistoryOutlined,
  EditOutlined
} from "@ant-design/icons";
import {
  get_borrow_return,
  edit_borrow_return,
} from "@/app/actions/adminActions";
import { getAuthCookie } from "@/app/actions/authActions";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

const { Search } = Input;
const { Option } = Select;

// --- Interface ---
interface BorrowReturn {
  borrow_id: number;
  user_name: string;
  book_title: string;
  borrow_date: string;
  return_date: string | null;
  due_date?: string | null;
  status: string;
  last_updated_by?: string;
}

export default function MyBooks() {
  const router = useRouter();
  const [form] = Form.useForm();
  
  // Data State
  const [myBorrowList, setMyBorrowList] = useState<BorrowReturn[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter State
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // User State
  const [currentUserName, setCurrentUserName] = useState<string>("");
  
  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BorrowReturn | null>(null);

  // --- API Calls ---
  const fetchMyBorrowedBooks = async () => {
    setLoading(true);
    try {
      const token = await getAuthCookie();
      if (!token) {
        message.error("Bạn chưa đăng nhập");
        router.push("/login");
        return;
      }

      // Lấy thông tin user từ token
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userName = payload.name || payload.email || "";
      setCurrentUserName(userName);

      // Gọi API lấy tất cả borrow_return
      const res = await get_borrow_return();
      if (res.success && res.data) {
        // Lọc chỉ lấy sách của user hiện tại
        const myBooks = res.data.filter((item: BorrowReturn) => 
          item.user_name === userName
        );
        setMyBorrowList(myBooks);
      }
    } catch (e) {
      console.error(e);
      message.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBorrowedBooks();
  }, []);

  // --- Logic Stats (Thống kê) ---
  const stats = useMemo(() => {
    return {
      total: myBorrowList.length,
      pending: myBorrowList.filter(i => i.status === "Yêu cầu").length,
      active: myBorrowList.filter(i => i.status === "Đang mượn").length,
      overdue: myBorrowList.filter(i => i.status === "Quá hạn").length,
      returned: myBorrowList.filter(i => i.status === "Đã trả").length,
    };
  }, [myBorrowList]);

  // --- Logic Filter ---
  const filteredList = myBorrowList.filter((item) => {
    const s = searchText.toLowerCase();
    const matchesSearch = item.book_title.toLowerCase().includes(s);
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // --- Render Status Tag ---
  const renderStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any; text: string }> = {
      "Yêu cầu": { color: "warning", icon: <ClockCircleOutlined />, text: "Đang chờ xét duyệt" },
      "Đang mượn": { color: "processing", icon: <BookOutlined />, text: "Đang mượn" },
      "Đã trả": { color: "success", icon: <CheckCircleOutlined />, text: "Đã trả" },
      "Quá hạn": { color: "error", icon: <WarningOutlined />, text: "Quá hạn trả" },
    };

    const config = statusConfig[status] || statusConfig["Yêu cầu"];
    return (
      <Tag color={config.color} icon={config.icon} className="px-3 py-1 rounded-full text-sm font-medium border-0">
        {config.text}
      </Tag>
    );
  };

  // --- Handlers ---
  const handleEdit = (record: BorrowReturn) => {
    setEditingRecord(record);
    form.setFieldsValue({
      book_title: record.book_title,
      borrow_date: record.borrow_date ? dayjs(record.borrow_date) : null,
      due_date: record.due_date ? dayjs(record.due_date) : null,
      return_date: record.return_date ? dayjs(record.return_date) : null,
    });
    setIsModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const token = await getAuthCookie();

      if (!editingRecord) return;

      const payload = {
        borrow_id: editingRecord.borrow_id,
        user_name: editingRecord.user_name,
        book_title: editingRecord.book_title,
        borrow_date: values.borrow_date.format("YYYY-MM-DD"),
        due_date: values.due_date ? values.due_date.format("YYYY-MM-DD") : null,
        return_date: values.return_date ? values.return_date.format("YYYY-MM-DD") : null,
        status: editingRecord.status, // Giữ nguyên trạng thái hiện tại
        last_updated_by: currentUserName,
        token: token,
      };

      const res = await edit_borrow_return(payload);

      if (res.success) {
        message.success("Cập nhật thành công!");
        setIsModalVisible(false);
        fetchMyBorrowedBooks();
      } else {
        message.error(res.message || "Có lỗi xảy ra");
      }
    } catch (e) {
      console.error(e);
      message.error("Có lỗi xảy ra khi cập nhật");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 m-0 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <BookOutlined className="text-indigo-600 text-2xl" />
              </div>
              Sách của tôi
            </h1>
            <p className="text-gray-500 mt-2 ml-14">Quản lý sách bạn đang mượn và lịch sử mượn trả</p>
          </div>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchMyBorrowedBooks}
            size="large"
            className="border-gray-300 text-gray-600 hover:border-indigo-500 hover:text-indigo-600"
          >
            Làm mới
          </Button>
        </div>

        {/* Stats Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={12} md={6}>
            <Card bordered={false} className="shadow-md rounded-2xl border-t-4 border-t-yellow-500 hover:shadow-lg transition-shadow">
              <Statistic 
                title={<span className="text-gray-600">Yêu cầu</span>} 
                value={stats.pending} 
                valueStyle={{ color: '#eab308', fontWeight: 'bold', fontSize: '2rem' }} 
                prefix={<ClockCircleOutlined />} 
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card bordered={false} className="shadow-md rounded-2xl border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
              <Statistic 
                title={<span className="text-gray-600">Đang mượn</span>} 
                value={stats.active} 
                valueStyle={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '2rem' }} 
                prefix={<BookOutlined />} 
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card bordered={false} className="shadow-md rounded-2xl border-t-4 border-t-red-500 hover:shadow-lg transition-shadow">
              <Statistic 
                title={<span className="text-gray-600">Quá hạn</span>} 
                value={stats.overdue} 
                valueStyle={{ color: '#ef4444', fontWeight: 'bold', fontSize: '2rem' }} 
                prefix={<WarningOutlined />} 
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card bordered={false} className="shadow-md rounded-2xl border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
              <Statistic 
                title={<span className="text-gray-600">Đã trả</span>} 
                value={stats.returned} 
                valueStyle={{ color: '#10b981', fontWeight: 'bold', fontSize: '2rem' }} 
                prefix={<CheckCircleOutlined />} 
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card bordered={false} className="shadow-md rounded-2xl">
          <div className="flex flex-col md:flex-row gap-4">
            <Input 
              prefix={<SearchOutlined className="text-gray-400" />} 
              placeholder="Tìm kiếm theo tên sách..." 
              className="md:flex-1 rounded-lg"
              size="large"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
            <Select 
              value={filterStatus}
              className="md:w-56" 
              size="large"
              onChange={setFilterStatus}
              options={[
                { value: "all", label: "📚 Tất cả trạng thái" },
                { value: "Yêu cầu", label: "⏳ Yêu cầu" },
                { value: "Đang mượn", label: "📖 Đang mượn" },
                { value: "Quá hạn", label: "⚠️ Quá hạn" },
                { value: "Đã trả", label: "✅ Đã trả" },
              ]}
            />
          </div>
        </Card>

        {/* Books List */}
        <Card bordered={false} className="shadow-md rounded-2xl">
          <Table
            columns={[
              {
                title: "Tên sách",
                dataIndex: "book_title",
                key: "book_title",
                width: "35%",
                render: (text: string) => (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                      <BookOutlined className="text-xl" />
                    </div>
                    <span className="font-medium text-gray-800">{text}</span>
                  </div>
                ),
              },
              {
                title: "Ngày mượn",
                dataIndex: "borrow_date",
                key: "borrow_date",
                width: "15%",
                render: (date: string) => (
                  <div className="flex items-center gap-2">
                    <CalendarOutlined className="text-indigo-500" />
                    <span>{dayjs(date).format("DD/MM/YYYY")}</span>
                  </div>
                ),
              },
              {
                title: "Hạn trả",
                dataIndex: "due_date",
                key: "due_date",
                width: "15%",
                render: (date: string | null) => (
                  date ? (
                    <div className="flex items-center gap-2">
                      <ClockCircleOutlined className="text-orange-500" />
                      <span>{dayjs(date).format("DD/MM/YYYY")}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Chưa có</span>
                  )
                ),
              },
              {
                title: "Ngày trả",
                dataIndex: "return_date",
                key: "return_date",
                width: "15%",
                render: (date: string | null) => (
                  date ? (
                    <div className="flex items-center gap-2">
                      <CheckCircleOutlined className="text-green-500" />
                      <span>{dayjs(date).format("DD/MM/YYYY")}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Chưa trả</span>
                  )
                ),
              },
              {
                title: "Trạng thái",
                dataIndex: "status",
                key: "status",
                width: "20%",
                render: (status: string, record: BorrowReturn) => (
                  <div className="space-y-2">
                    {renderStatusTag(status)}
                    {status === "Đang mượn" && record.due_date && !record.return_date && (
                      <div className="text-xs text-blue-600">
                        {(() => {
                          const daysLeft = dayjs(record.due_date).diff(dayjs(), 'day');
                          if (daysLeft > 0) {
                            return `Còn ${daysLeft} ngày`;
                          } else if (daysLeft === 0) {
                            return `Hôm nay là hạn trả`;
                          } else {
                            return `Quá hạn ${Math.abs(daysLeft)} ngày`;
                          }
                        })()}
                      </div>
                    )}
                    {status === "Quá hạn" && record.due_date && (
                      <div className="text-xs text-red-600">
                        Quá hạn {Math.abs(dayjs(record.due_date).diff(dayjs(), 'day'))} ngày
                      </div>
                    )}
                  </div>
                ),
              },
              {
                title: "Hành động",
                key: "actions",
                width: "10%",
                fixed: "right" as const,
                render: (_: any, record: BorrowReturn) => (
                  record.status === "Yêu cầu" ? (
                    <Tooltip title="Chỉnh sửa">
                      <Button
                        type="text"
                        shape="circle"
                        icon={<EditOutlined className="text-indigo-600" />}
                        className="bg-indigo-50 hover:bg-indigo-100"
                        onClick={() => handleEdit(record)}
                      />
                    </Tooltip>
                  ) : (
                    <Tooltip title="Chỉ có thể sửa khi ở trạng thái yêu cầu">
                      <Button
                        type="text"
                        shape="circle"
                        icon={<EditOutlined className="text-gray-400" />}
                        className="bg-gray-100 cursor-not-allowed"
                        disabled
                      />
                    </Tooltip>
                  )
                ),
              },
            ]}
            dataSource={filteredList}
            rowKey="borrow_id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Tổng cộng ${total} phiếu mượn`,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
            }}
            locale={{
              emptyText: (
                <Empty
                  description={
                    <div className="py-8">
                      <p className="text-gray-500 text-lg mb-2">Không tìm thấy sách nào</p>
                      <p className="text-gray-400">Bạn chưa mượn sách hoặc không có kết quả phù hợp với bộ lọc</p>
                    </div>
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
            scroll={{ x: 1000 }}
            className="custom-table"
          />
        </Card>

      </div>

      {/* Modal Edit */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-indigo-700 text-lg">
            <EditOutlined />
            <span>Chỉnh sửa thông tin mượn sách</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit}
        okText="Cập nhật"
        cancelText="Hủy"
        width={600}
        centered
        okButtonProps={{ className: "bg-indigo-600 hover:bg-indigo-500 border-none h-10 px-6" }}
        cancelButtonProps={{ className: "h-10 px-6 hover:text-indigo-600 hover:border-indigo-600" }}
      >
        <Form 
          form={form} 
          layout="vertical" 
          className="mt-6"
          onValuesChange={(changedValues) => {
            // Tự động tính hạn trả sau 3 tuần (21 ngày) khi chọn ngày mượn
            if (changedValues.borrow_date) {
              const dueDate = changedValues.borrow_date.add(21, 'day');
              form.setFieldsValue({ due_date: dueDate });
            }
          }}
        >
          <Form.Item label="Tên sách" name="book_title">
            <Input disabled className="bg-gray-50" prefix={<BookOutlined className="text-gray-400" />} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Ngày mượn" 
                name="borrow_date" 
                rules={[{ required: true, message: "Vui lòng chọn ngày mượn" }]}
              >
                <DatePicker 
                  className="w-full" 
                  size="large" 
                  format="DD/MM/YYYY" 
                  placeholder="Chọn ngày mượn"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Hạn trả (Tự động: 3 tuần sau ngày mượn)" name="due_date">
                <DatePicker 
                  className="w-full" 
                  size="large" 
                  format="DD/MM/YYYY" 
                  placeholder="Tự động sau 3 tuần"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Ngày trả thực tế" name="return_date">
            <DatePicker 
              className="w-full" 
              size="large" 
              format="DD/MM/YYYY" 
              placeholder="Chọn ngày trả"
              allowClear
            />
          </Form.Item>

          {editingRecord && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <WarningOutlined className="text-yellow-600" />
                <span className="text-sm text-gray-700">
                  Trạng thái hiện tại: {renderStatusTag(editingRecord.status)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2 mb-0">
                Chỉ có thể chỉnh sửa thông tin khi ở trạng thái "Yêu cầu". Trạng thái sẽ được quản trị viên cập nhật.
              </p>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
}