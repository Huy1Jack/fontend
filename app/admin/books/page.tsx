"use client";
import { useEffect, useState } from "react";
import Image from "next/image"; // Import next/image
import {
  Table,
  Space,
  Button,
  Input,
  Select,
  Card,
  Modal,
  message,
  Form,
  Upload,
  Tag,
  Row,
  Col,
  Typography,
  Tooltip,
  Divider,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
  SearchOutlined,
  ReadOutlined,
  FilePdfOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import {
  get_book_admin,
  del_book_admin,
  edit_book_admin,
  add_book_admin,
  get_authors_and_categories,
  get_publishers,
} from "@/app/actions/adminActions";
import { getAuthCookie } from "@/app/actions/authActions";
import { useRouter } from "next/navigation";

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

// --- Interface ---
interface Book {
  books_id: number;
  Title: string;
  Description: string;
  ISBN: string;
  Language: string;
  PublishYear: number;
  DocumentType: string;
  image: string;
  document: string;
  IsPublic: number;
  UploadDate: string;
  UploadedBy: string;
  category_id: number;
  category_name: string;
  publisher_id: number;
  publisher_name: string;
  author_ids: number[];
  authors: string;
}

export default function AdminBooks() {
  const router = useRouter();
  
  // --- State Management ---
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("all");
  const [filterCategory, setFilterCategory] = useState<number | "all">("all");
  const [filterAuthor, setFilterAuthor] = useState<number | "all">("all");

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newBook, setNewBook] = useState<any>({
    Title: "",
    Description: "",
    ISBN: "",
    PublishYear: new Date().getFullYear(),
    Language: "",
    DocumentType: "",
    publisher_id: null,
    category_id: null,
    author_ids: [],
    image: "",
    document: "",
    IsPublic: 1,
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [publishers, setPublishers] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);

  // --- Styles Constants ---
  const pageStyle: React.CSSProperties = {
    padding: "24px",
    background: "#f0f2f5", // Nền xám nhạt hiện đại
    minHeight: "100vh",
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    border: "none",
    marginBottom: "24px",
  };

  // --- Effects ---
  useEffect(() => {
    fetchBooks();
    fetchAuthorsAndCategories();
    fetchPublishers();
    checkUser();
  }, []);

  // --- API Functions ---
  const fetchBooks = async () => {
    try {
      const token = await getAuthCookie();
      if (!token) {
        message.error("Bạn chưa đăng nhập");
        router.push("/");
        return;
      }
      const response = await get_book_admin();
      if (response.success && response.data) {
        setBooks(response.data);
      } else {
        message.error(response.message || "Không thể tải danh sách sách");
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthorsAndCategories = async () => {
    try {
      const response = await get_authors_and_categories();
      if (response.success && response.data) {
        setAuthors(response.data.authors || []);
        setCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPublishers = async () => {
    try {
      const response = await get_publishers();
      if (response.success && response.data) {
        setPublishers(response.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const checkUser = async () => {
    try {
      const token = await getAuthCookie();
      if (!token) return;
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (![1, 2].includes(payload.role)) {
        message.error("Bạn không có quyền truy cập");
        router.push("/");
      }
    } catch (error) {
      router.push("/");
    }
  };

  // --- Action Handlers ---
  const handleAddBook = async () => {
    try {
      const token = await getAuthCookie();
      if (!token) return;

      if (!newBook.Title || newBook.author_ids.length === 0) {
        message.error("Vui lòng nhập tiêu đề và chọn tác giả");
        return;
      }

      const response = await add_book_admin(newBook);
      if (response.success) {
        message.success("Thêm sách thành công!");
        setIsAddModalVisible(false);
        setNewBook({
            Title: "", Description: "", ISBN: "", PublishYear: new Date().getFullYear(),
            Language: "", DocumentType: "", publisher_id: null, category_id: null,
            author_ids: [], image: "", document: "", IsPublic: 1,
        });
        fetchBooks();
      } else {
        message.error(response.message || "Lỗi thêm sách");
      }
    } catch (error) {
      message.error("Lỗi hệ thống");
    }
  };

  const handleEdit = (record: Book) => {
    const selectedAuthorIds = record.author_ids || authors
      .filter((a) => record.authors?.includes(a.author_name))
      .map((a) => a.author_id);

    setEditingBook({ ...record, author_ids: selectedAuthorIds });
    setIsEditModalVisible(true);
  };

  const handleDelete = (record: Book) => {
    Modal.confirm({
      title: "Cảnh báo xóa",
      content: (
        <div>
            Bạn có chắc muốn xóa sách: <b>{record.Title}</b>?
            <br/><span style={{fontSize: '12px', color: 'red'}}>Hành động này không thể hoàn tác.</span>
        </div>
      ),
      okText: "Xóa ngay",
      okType: "danger",
      cancelText: "Hủy bỏ",
      centered: true,
      onOk: async () => {
        try {
          const response = await del_book_admin({ books_id: record.books_id });
          if (response.success) {
            message.success(`Đã xóa: ${record.Title}`);
            fetchBooks();
          } else {
            message.error(response.message);
          }
        } catch (error) {
          message.error("Lỗi khi xóa");
        }
      },
    });
  };

  const handleEditSubmit = async () => {
    if (!editingBook) return;
    try {
      const token = await getAuthCookie();
      const response = await edit_book_admin({
        token: token,
        api_key: process.env.NEXT_PUBLIC_API_KEY,
        datauser: editingBook,
      });

      if (response.success) {
        message.success("Cập nhật thành công");
        setIsEditModalVisible(false);
        fetchBooks();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error("Lỗi cập nhật");
    }
  };

  // --- Filters Logic ---
  const filteredBooks = books.filter((book) => {
    const search = searchText.toLowerCase();
    const matchesSearch =
      book.Title.toLowerCase().includes(search) ||
      book.authors?.toLowerCase().includes(search) ||
      book.category_name?.toLowerCase().includes(search);

    const matchesCategory = filterCategory === "all" || book.category_id === filterCategory;
    const matchesAuthor = filterAuthor === "all" || book.author_ids?.includes(filterAuthor as number);

    return matchesSearch && matchesCategory && matchesAuthor;
  });

  // --- Table Columns ---
  const columns = [
    {
      title: "Bìa sách",
      dataIndex: "image",
      key: "image",
      width: 90,
      render: (img: string) => (
        <div style={{ 
            position: 'relative', 
            width: 60, 
            height: 85, 
            borderRadius: 6, 
            overflow: 'hidden', 
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)' 
        }}>
            <Image 
                src={img ? `/api/get_file?file=${img}` : "/books/default.jpg"}
                alt="Book cover"
                fill
                sizes="80px"
                style={{ objectFit: 'cover' }}
                unoptimized={true} // Bật cái này nếu ảnh từ API nội bộ
            />
        </div>
      ),
    },
    {
      title: "Thông tin sách",
      dataIndex: "Title",
      key: "Title",
      render: (text: string, record: Book) => (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Text strong style={{ fontSize: '15px', color: '#1890ff' }}>{text}</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <ReadOutlined style={{ marginRight: 4 }} /> 
                {record.authors || 'Chưa cập nhật'}
              </Text>
              <div style={{ marginTop: 4 }}>
                  <Tag color="cyan">{record.category_name}</Tag>
                  {record.PublishYear > 0 && <Tag>{record.PublishYear}</Tag>}
              </div>
          </div>
      )
    },
    {
      title: "Trạng thái",
      dataIndex: "IsPublic",
      key: "IsPublic",
      width: 120,
      align: 'center' as const,
      render: (val: number) => (
        <Tag 
            color={val === 1 ? "success" : "default"} 
            style={{ borderRadius: '12px', padding: '0 10px', fontWeight: 500 }}
        >
          {val === 1 ? "Công khai" : "Riêng tư"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      fixed: "right" as const,
      align: 'center' as const,
      render: (_: any, record: Book) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
                type="text"
                shape="circle"
                icon={<EditOutlined style={{ color: '#1890ff' }} />}
                onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
                type="text"
                shape="circle"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // --- Render Main ---
  return (
    <div style={pageStyle}>
      {/* --- HEADER SECTION --- */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0, color: '#262626' }}>Quản lý Thư viện</Title>
            <Text type="secondary">Quản lý sách, tài liệu và ấn phẩm điện tử</Text>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => setIsAddModalVisible(true)}
            style={{ 
                borderRadius: '8px', 
                height: '45px', 
                padding: '0 25px', 
                boxShadow: '0 4px 14px 0 rgba(24,144,255,0.3)',
                fontWeight: 600
            }}
          >
            Thêm sách
          </Button>
      </div>

      {/* --- FILTER TOOLBAR --- */}
      <Card style={cardStyle} bodyStyle={{ padding: '16px 24px' }}>
          <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={8}>
                  <Input 
                    placeholder="Tìm kiếm tên sách, tác giả..." 
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    size="large"
                    allowClear
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ borderRadius: '8px' }}
                  />
              </Col>
              <Col xs={24} md={1}>
                  <Divider type="vertical" style={{ height: '30px' }} />
              </Col>
              <Col xs={12} md={5}>
                 <Space direction="vertical" style={{ width: '100%' }} size={4}>
                     <Text type="secondary" style={{ fontSize: '12px' }}>DANH MỤC</Text>
                     <Select
                        value={filterCategory}
                        onChange={setFilterCategory}
                        style={{ width: '100%' }}
                        size="large"
                        suffixIcon={<FilterOutlined />}
                    >
                        <Option value="all">Tất cả</Option>
                        {categories.map((c) => (
                            <Option key={c.category_id} value={c.category_id}>{c.category_name}</Option>
                        ))}
                    </Select>
                 </Space>
              </Col>
              <Col xs={12} md={5}>
                <Space direction="vertical" style={{ width: '100%' }} size={4}>
                     <Text type="secondary" style={{ fontSize: '12px' }}>TÁC GIẢ</Text>
                     <Select
                        value={filterAuthor}
                        onChange={setFilterAuthor}
                        style={{ width: '100%' }}
                        size="large"
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) => (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())}
                    >
                        <Option value="all">Tất cả</Option>
                        {authors.map((a) => (
                            <Option key={a.author_id} value={a.author_id}>{a.author_name}</Option>
                        ))}
                    </Select>
                 </Space>
              </Col>
          </Row>
      </Card>

      {/* --- DATA TABLE --- */}
      <Card style={{ ...cardStyle, overflow: 'hidden' }} bodyStyle={{ padding: 0 }}>
          <Table
            columns={columns}
            dataSource={filteredBooks}
            rowKey="books_id"
            loading={loading}
            pagination={{ 
                pageSize: 8, 
                showSizeChanger: false, 
                position: ['bottomCenter'],
                style: { padding: '20px 0' }
            }}
            rowClassName={() => 'editable-row'}
          />
      </Card>

      {/* --- MODAL EDIT --- */}
      <Modal
        title={<div style={{ fontSize: '18px', fontWeight: 600 }}>✏️ Chỉnh sửa sách</div>}
        open={isEditModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setIsEditModalVisible(false)}
        width={800}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        centered
        styles={{ body: { padding: '24px 0 0 0' } }}
      >
        {editingBook && (
          <Form layout="vertical">
            <Row gutter={24}>
              <Col span={16}>
                  <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item label="Tiêu đề sách" required>
                            <Input size="large" value={editingBook.Title} onChange={(e) => setEditingBook({ ...editingBook, Title: e.target.value })} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Danh mục">
                            <Select size="large" value={editingBook.category_id} onChange={(v) => setEditingBook({ ...editingBook, category_id: v })}>
                                {categories.map((c) => <Option key={c.category_id} value={c.category_id}>{c.category_name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Tác giả" required>
                            <Select size="large" mode="multiple" value={editingBook.author_ids} onChange={(vals) => setEditingBook({ ...editingBook, author_ids: vals })}>
                                {authors.map((a) => <Option key={a.author_id} value={a.author_id}>{a.author_name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label="Mô tả tóm tắt">
                            <Input.TextArea rows={4} value={editingBook.Description} onChange={(e) => setEditingBook({ ...editingBook, Description: e.target.value })} />
                        </Form.Item>
                    </Col>
                  </Row>
              </Col>
              
              {/* Cột bên phải cho Ảnh và Upload */}
              <Col span={8}>
                 <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                    <Form.Item label="Ảnh bìa" style={{ marginBottom: 12 }}>
                        <Upload
                            name="file" listType="picture-card" showUploadList={false}
                            action="/api/upload_file" data={{ tieuChuan: "book", tieuChi: "image" }}
                            onChange={(info) => {
                                if (info.file.status === "done") {
                                    setEditingBook({ ...editingBook, image: info.file.response.filepath });
                                    message.success("Đã tải ảnh lên");
                                }
                            }}
                        >
                            {editingBook.image ? (
                                <img src={`/api/get_file?file=${editingBook.image}`} alt="cover" style={{ width: "100%", height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                            ) : <div><UploadOutlined /><div style={{ marginTop: 8 }}>Tải ảnh</div></div>}
                        </Upload>
                    </Form.Item>

                    <Form.Item label="File PDF" style={{ marginBottom: 0 }}>
                        <Upload
                            name="file" showUploadList={false}
                            action="/api/upload_file" data={{ tieuChuan: "book", tieuChi: "document" }}
                            onChange={(info) => {
                                if (info.file.status === "done") {
                                    setEditingBook({ ...editingBook, document: info.file.response.filepath });
                                    message.success("Đã tải PDF lên");
                                }
                            }}
                        >
                            <Button icon={<UploadOutlined />} block>{editingBook.document ? "Thay đổi PDF" : "Tải PDF lên"}</Button>
                        </Upload>
                    </Form.Item>
                 </div>
                 
                 <div style={{ marginTop: 16 }}>
                    <Form.Item label="Trạng thái">
                        <Select value={editingBook.IsPublic} onChange={(v) => setEditingBook({ ...editingBook, IsPublic: v })}>
                            <Option value={0}>Riêng tư (Private)</Option>
                            <Option value={1}>Công khai (Public)</Option>
                        </Select>
                    </Form.Item>
                 </div>
              </Col>
            </Row>

            {/* Các trường phụ ẩn bớt trong Collapse hoặc để dưới cùng */}
            <Divider plain>Thông tin chi tiết</Divider>
            <Row gutter={16}>
                <Col span={6}><Form.Item label="ISBN"><Input value={editingBook.ISBN} onChange={(e) => setEditingBook({ ...editingBook, ISBN: e.target.value })} /></Form.Item></Col>
                <Col span={6}><Form.Item label="Năm XB"><Input type="number" value={editingBook.PublishYear} onChange={(e) => setEditingBook({ ...editingBook, PublishYear: parseInt(e.target.value) })} /></Form.Item></Col>
                <Col span={6}><Form.Item label="Ngôn ngữ"><Input value={editingBook.Language} onChange={(e) => setEditingBook({ ...editingBook, Language: e.target.value })} /></Form.Item></Col>
                <Col span={6}><Form.Item label="Loại"><Input value={editingBook.DocumentType} onChange={(e) => setEditingBook({ ...editingBook, DocumentType: e.target.value })} /></Form.Item></Col>
                <Col span={12}>
                    <Form.Item label="Nhà xuất bản">
                        <Select value={editingBook.publisher_id} onChange={(v) => setEditingBook({ ...editingBook, publisher_id: v })}>
                            {publishers.map((p) => <Option key={p.publisher_id} value={p.publisher_id}>{p.publisher_name}</Option>)}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
          </Form>
        )}
      </Modal>

      {/* --- MODAL ADD --- */}
      <Modal
        title={<div style={{ fontSize: '18px', fontWeight: 600 }}>📚 Thêm sách</div>}
        open={isAddModalVisible}
        onOk={handleAddBook}
        onCancel={() => setIsAddModalVisible(false)}
        width={800}
        okText="Thêm ngay"
        cancelText="Hủy"
        centered
        styles={{ body: { padding: '24px 0 0 0' } }}
      >
        <Form layout="vertical">
          <Row gutter={24}>
              <Col span={16}>
                  <Form.Item label="Tiêu đề sách" required>
                    <Input size="large" placeholder="Nhập tên sách..." value={newBook.Title} onChange={(e) => setNewBook({ ...newBook, Title: e.target.value })} />
                  </Form.Item>
                  <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Tác giả" required>
                            <Select size="large" mode="multiple" placeholder="Chọn tác giả" value={newBook.author_ids} onChange={(vals) => setNewBook({ ...newBook, author_ids: vals })}>
                            {authors.map((a) => <Option key={a.author_id} value={a.author_id}>{a.author_name}</Option>)}
                            </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Danh mục">
                            <Select size="large" placeholder="Chọn danh mục" value={newBook.category_id} onChange={(v) => setNewBook({ ...newBook, category_id: v })}>
                            {categories.map((c) => <Option key={c.category_id} value={c.category_id}>{c.category_name}</Option>)}
                            </Select>
                        </Form.Item>
                      </Col>
                  </Row>
                  <Form.Item label="Mô tả">
                    <Input.TextArea rows={3} placeholder="Tóm tắt nội dung..." value={newBook.Description} onChange={(e) => setNewBook({ ...newBook, Description: e.target.value })} />
                  </Form.Item>
              </Col>
              
              <Col span={8}>
                 <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                    <Form.Item label="Ảnh bìa" style={{marginBottom: 12}}>
                        <Upload
                            name="file" listType="picture-card" showUploadList={false}
                            action="/api/upload_file" data={{ tieuChuan: "book", tieuChi: "image" }}
                            onChange={(info) => {
                                if (info.file.status === "done") {
                                    setNewBook((prev: any) => ({ ...prev, image: info.file.response.filepath }));
                                    message.success("Đã tải ảnh");
                                }
                            }}
                        >
                            {newBook.image ? (
                                <img src={`/api/get_file?file=${newBook.image}`} alt="cover" style={{ width: "100%", height: '100%', objectFit: 'cover' }} />
                            ) : <div><PlusOutlined /><div style={{ marginTop: 8 }}>Ảnh bìa</div></div>}
                        </Upload>
                    </Form.Item>
                    
                    <Form.Item style={{ marginBottom: 0 }}>
                        <Upload
                            name="file" showUploadList={false}
                            action="/api/upload_file" data={{ tieuChuan: "book", tieuChi: "document" }}
                            onChange={(info) => {
                                if (info.file.status === "done") {
                                    setNewBook((prev: any) => ({ ...prev, document: info.file.response.filepath }));
                                    message.success("Đã tải PDF");
                                }
                            }}
                        >
                            <Button block icon={<UploadOutlined />}>{newBook.document ? "Đã có file PDF" : "Tải file PDF"}</Button>
                        </Upload>
                    </Form.Item>
                 </div>
              </Col>
          </Row>

          <Divider plain style={{ fontSize: '12px', color: '#999' }}>Thông tin bổ sung</Divider>
          
          <Row gutter={16}>
            <Col span={6}><Form.Item label="Năm XB"><Input type="number" value={newBook.PublishYear} onChange={(e) => setNewBook({ ...newBook, PublishYear: parseInt(e.target.value) })} /></Form.Item></Col>
            <Col span={6}><Form.Item label="ISBN"><Input value={newBook.ISBN} onChange={(e) => setNewBook({ ...newBook, ISBN: e.target.value })} /></Form.Item></Col>
            <Col span={6}><Form.Item label="Ngôn ngữ"><Input value={newBook.Language} onChange={(e) => setNewBook({ ...newBook, Language: e.target.value })} /></Form.Item></Col>
            <Col span={6}>
                 <Form.Item label="Trạng thái">
                    <Select value={newBook.IsPublic} onChange={(v) => setNewBook({ ...newBook, IsPublic: v })}>
                        <Option value={1}>Public</Option>
                        <Option value={0}>Private</Option>
                    </Select>
                </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}