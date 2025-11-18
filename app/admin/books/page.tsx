"use client";
import { useEffect, useState } from "react";
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
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  get_book_admin,
  del_book_admin,
  edit_book_admin,
  add_book_admin,
  get_authors_and_categories,
  get_publishers,
} from "@/app/sever/admin/route";
import { getAuthCookie } from "@/app/sever/authcookie/route";
import { useRouter } from "next/navigation";

const { Search } = Input;
const { Option } = Select;

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
  author_ids: number[]; // Quan trọng: Logic lọc tác giả dựa vào trường này
  authors: string;
}

export default function AdminBooks() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("all");
  
  // === THAY ĐỔI STATE BỘ LỌC ===
  const [filterCategory, setFilterCategory] = useState<number | "all">("all");
  const [filterAuthor, setFilterAuthor] = useState<number | "all">("all");
  // Đã bỏ filterDocType

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newBook, setNewBook] = useState<any>({
    Title: "",
    Description: "",
    ISBN: "",
    PublishYear: "",
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

  // ================================
  // FETCH DATA
  // ================================
  useEffect(() => {
    fetchBooks();
    fetchAuthorsAndCategories();
    fetchPublishers();
    checkUser();
  }, []);

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
      message.error("Đã xảy ra lỗi khi tải danh sách sách");
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
      console.error("Error fetching authors and categories:", error);
    }
  };

  const fetchPublishers = async () => {
    try {
      const response = await get_publishers();
      if (response.success && response.data) {
        setPublishers(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching publishers:", error);
    }
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
      if (![1, 2].includes(payload.role)) {
        message.error("Bạn không có quyền truy cập trang này");
        router.push("/");
      }
    } catch (error) {
      console.error("Error checking user:", error);
      message.error("Máy chủ không phản hồi");
      router.push("/");
    }
  };

  // ================================
  // ACTIONS
  // ================================

  const handleAddBook = async () => {
    try {
      const token = await getAuthCookie();
      if (!token) {
        message.error("Bạn chưa đăng nhập");
        return;
      }

      if (!newBook.Title || newBook.author_ids.length === 0) {
        message.error("Vui lòng nhập tiêu đề và chọn ít nhất một tác giả");
        return;
      }

      console.log(newBook);

      const response = await add_book_admin(newBook);

      if (response.success) {
        message.success("Thêm sách thành công!");
        setIsAddModalVisible(false);
        setNewBook({
          Title: "",
          Description: "",
          ISBN: "",
          PublishYear: "",
          Language: "",
          DocumentType: "",
          publisher_id: null,
          category_id: null,
          author_ids: [],
          image: "",
          document: "",
          IsPublic: 1,
        });
        fetchBooks();
      } else {
        message.error(response.message || "Không thể thêm sách");
      }
    } catch (error) {
      console.error("Error adding book:", error);
      message.error("Lỗi khi thêm sách");
    }
  };

  const handleEdit = (record: Book) => {
    // Logic này giả định record.authors (string) là nguồn chính
    // Nhưng để nhất quán, chúng ta nên dùng record.author_ids (number[]) nếu có
    // Nếu API trả về author_ids, dùng trực tiếp
    const selectedAuthorIds = record.author_ids || authors
      .filter((a) => record.authors?.includes(a.author_name))
      .map((a) => a.author_id);

    setEditingBook({ ...record, author_ids: selectedAuthorIds });
    setIsEditModalVisible(true);
  };

  const handleDelete = (record: Book) => {
    Modal.confirm({
      title: "Xác nhận xóa sách",
      content: `Bạn có chắc chắn muốn xóa sách "${record.Title}" không?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const token = await getAuthCookie();
          const response = await del_book_admin({ books_id: record.books_id });
          if (response.success) {
            message.success(`Đã xóa sách: ${record.Title}`);
            fetchBooks();
          } else {
            message.error(response.message || "Không thể xóa sách");
          }
        } catch (error) {
          message.error("Lỗi khi xóa sách");
        }
      },
    });
  };

  const handleEditSubmit = async () => {
    if (!editingBook) return;
    try {
      const token = await getAuthCookie();

      const dataUser = {
        books_id: editingBook.books_id,
        Title: editingBook.Title,
        Description: editingBook.Description,
        ISBN: editingBook.ISBN,
        PublishYear: editingBook.PublishYear,
        Language: editingBook.Language,
        DocumentType: editingBook.DocumentType,
        publisher_id: editingBook.publisher_id,
        category_id: editingBook.category_id,
        author_ids: editingBook.author_ids,
        image: editingBook.image,
        document: editingBook.document,
        IsPublic: editingBook.IsPublic,
      };

      const response = await edit_book_admin({
        token: token,
        api_key: process.env.NEXT_PUBLIC_API_KEY,
        datauser: dataUser,
      });

      if (response.success) {
        message.success("Cập nhật thông tin sách thành công");
        setIsEditModalVisible(false);
        fetchBooks();
      } else {
        message.error(response.message || "Không thể cập nhật sách");
      }
    } catch (error) {
      console.error("Error updating book:", error);
      message.error("Đã xảy ra lỗi khi cập nhật sách");
    }
  };

  // ================================
  // FILTERS
  // ================================

  const languages = Array.from(new Set(books.map((b) => b.Language)));
  // Đã bỏ documentTypes

  const filteredBooks = books.filter((book) => {
    const search = searchText.toLowerCase();
    const matchesSearch =
      book.Title.toLowerCase().includes(search) ||
      book.Description?.toLowerCase().includes(search) ||
      book.ISBN?.toLowerCase().includes(search) ||
      book.authors?.toLowerCase().includes(search) ||
      book.category_name?.toLowerCase().includes(search) ||
      book.publisher_name?.toLowerCase().includes(search);

    const matchesLang =
      filterLanguage === "all" || book.Language === filterLanguage;

    // === CẬP NHẬT LOGIC LỌC ===
    const matchesCategory =
      filterCategory === "all" || book.category_id === filterCategory;
    
    const matchesAuthor =
      filterAuthor === "all" || book.author_ids?.includes(filterAuthor as number);
    // Đã bỏ matchesDoc

    return matchesSearch && matchesLang && matchesCategory && matchesAuthor;
  });

  // ================================
  // TABLE
  // ================================
  const columns = [
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      width: 100,
      render: (img: string) => (
        <img
          src={img ? `/api/get_file?file=${img}` : "/books/default.jpg"}
          alt="Book cover"
          style={{
            width: 70,
            height: 100,
            objectFit: "cover",
            borderRadius: 4,
            border: "1px solid #ddd",
          }}
        />
      ),
    },
    {
      title: "Tên sách",
      dataIndex: "Title",
      key: "Title",
      sorter: (a: Book, b: Book) => a.Title.localeCompare(b.Title),
    },
    {
      title: "Tác giả",
      dataIndex: "authors",
      key: "authors",
      width: 200,
      render: (authors: string) => (
        <div>{authors?.split(", ").map((a, i) => <div key={i}>{a}</div>)}</div>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category_name",
      key: "category_name",
      width: 180,
    },
    {
      title: "Năm XB",
      dataIndex: "PublishYear",
      key: "PublishYear",
      width: 100,
      sorter: (a: Book, b: Book) => a.PublishYear - b.PublishYear,
    },
    {
      title: "Trạng thái",
      dataIndex: "IsPublic",
      key: "IsPublic",
      width: 100,
      render: (val: number) => (
        <Tag color={val === 1 ? "green" : "red"}>
          {val === 1 ? "Public" : "Private"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 160,
      fixed: "right" as const,
      render: (_: any, record: Book) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  // ================================
  // RENDER
  // ================================
  return (
    <Card
      title="QUẢN LÝ SÁCH"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsAddModalVisible(true)}
        >
          Thêm sách
        </Button>
      }
    >
      {/* === CẬP NHẬT KHU VỰC BỘ LỌC === */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Search
          placeholder="Tìm kiếm sách..."
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        {/* LỌC THEO DANH MỤC */}
        <Select
          value={filterCategory}
          onChange={(v) => setFilterCategory(v)}
          style={{ width: 200 }}
          placeholder="Lọc theo danh mục"
        >
          <Option value="all">Tất cả danh mục</Option>
          {categories.map((c) => (
            <Option key={c.category_id} value={c.category_id}>
              {c.category_name}
            </Option>
          ))}
        </Select>

        {/* LỌC THEO TÁC GỈA */}
        <Select
          value={filterAuthor}
          onChange={(v) => setFilterAuthor(v)}
          style={{ width: 200 }}
          placeholder="Lọc theo tác giả"
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.children as unknown as string)
              .toLowerCase()
              .includes(input.toLowerCase())
          }
        >
          <Option value="all">Tất cả tác giả</Option>
          {authors.map((a) => (
            <Option key={a.author_id} value={a.author_id}>
              {a.author_name}
            </Option>
          ))}
        </Select>

        {/* ĐÃ BỎ LỌC THEO LOẠI TÀI LIỆU */}
      </Space>

      <Table
        columns={columns}
        dataSource={filteredBooks}
        rowKey="books_id"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />

      {/* MODAL CHỈNH SỬA */}
      <Modal
        title="Chỉnh sửa thông tin sách"
        open={isEditModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setIsEditModalVisible(false)}
        width={800}
      >
        {editingBook && (
          <Form layout="vertical">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Tiêu đề" required>
                  <Input
                    value={editingBook.Title}
                    onChange={(e) =>
                      setEditingBook({ ...editingBook, Title: e.target.value })
                    }
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="ISBN">
                  <Input
                    value={editingBook.ISBN}
                    onChange={(e) =>
                      setEditingBook({ ...editingBook, ISBN: e.target.value })
                    }
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Mô tả">
              <Input.TextArea
                rows={3}
                value={editingBook.Description}
                onChange={(e) =>
                  setEditingBook({
                    ...editingBook,
                    Description: e.target.value,
                  })
                }
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Tác giả" required>
                  <Select
                    mode="multiple"
                    value={editingBook.author_ids}
                    onChange={(vals) =>
                      setEditingBook({ ...editingBook, author_ids: vals })
                    }
                    placeholder="Chọn tác giả"
                  >
                    {authors.map((a) => (
                      <Option key={a.author_id} value={a.author_id}>
                        {a.author_name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Danh mục">
                  <Select
                    value={editingBook.category_id}
                    onChange={(v) =>
                      setEditingBook({ ...editingBook, category_id: v })
                    }
                  >
                    {categories.map((c) => (
                      <Option key={c.category_id} value={c.category_id}>
                        {c.category_name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Nhà xuất bản">
                  <Select
                    value={editingBook.publisher_id}
                    onChange={(v) =>
                      setEditingBook({ ...editingBook, publisher_id: v })
                    }
                  >
                    {publishers.map((p) => (
                      <Option key={p.publisher_id} value={p.publisher_id}>
                        {p.publisher_name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Năm xuất bản">
                  <Input
                    type="number"
                    value={editingBook.PublishYear}
                    onChange={(e) =>
                      setEditingBook({
                        ...editingBook,
                        PublishYear: parseInt(e.target.value),
                      })
                    }
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Ngôn ngữ">
                  <Input
                    value={editingBook.Language}
                    onChange={(e) =>
                      setEditingBook({
                        ...editingBook,
                        Language: e.target.value,
                      })
                    }
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Loại tài liệu">
                  <Input
                    value={editingBook.DocumentType}
                    onChange={(e) =>
                      setEditingBook({
                        ...editingBook,
                        DocumentType: e.target.value,
                      })
                    }
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Ảnh bìa">
                  <Upload
                    name="file"
                    listType="picture-card"
                    className="avatar-uploader"
                    showUploadList={false}
                    action="/api/upload_file"
                    data={{ tieuChuan: "book", tieuChi: "image" }}
                    onChange={(info) => {
                      if (info.file.status === "done") {
                        setEditingBook({
                          ...editingBook,
                          image: info.file.response.filepath,
                        });
                        message.success("Upload ảnh thành công");
                      } else if (info.file.status === "error") {
                        message.error("Upload ảnh thất bại");
                      }
                    }}
                  >
                    {editingBook.image ? (
                      <img
                        src={`/api/get_file?file=${editingBook.image}`}
                        alt="avatar"
                        style={{ width: "100%" }}
                      />
                    ) : (
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Tài liệu sách (PDF)">
                  <Upload
                    name="file"
                    listType="picture-card"
                    className="document-uploader"
                    showUploadList={false}
                    action="/api/upload_file"
                    data={{ tieuChuan: "book", tieuChi: "document" }}
                    onChange={(info) => {
                      if (info.file.status === "done") {
                        setEditingBook({
                          ...editingBook,
                          document: info.file.response.filepath,
                        });
                        message.success("Upload tài liệu thành công");
                      } else if (info.file.status === "error") {
                        message.error("Upload tài liệu thất bại");
                      }
                    }}
                  >
                    {editingBook.document ? (
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>PDF đã upload</div>
                      </div>
                    ) : (
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>Upload PDF</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Trạng thái">
              <Select
                value={editingBook.IsPublic}
                onChange={(v) =>
                  setEditingBook({ ...editingBook, IsPublic: v })
                }
              >
                <Option value={1}>Public</Option>
                <Option value={0}>Private</Option>
              </Select>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* MODAL THÊM SÁCH */}
      <Modal
        title="Thêm sách mới"
        open={isAddModalVisible}
        onOk={handleAddBook}
        onCancel={() => setIsAddModalVisible(false)}
        width={800}
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Tiêu đề" required>
                <Input
                  value={newBook.Title}
                  onChange={(e) =>
                    setNewBook({ ...newBook, Title: e.target.value })
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="ISBN">
                <Input
                  value={newBook.ISBN}
                  onChange={(e) =>
                    setNewBook({ ...newBook, ISBN: e.target.value })
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Mô tả">
            <Input.TextArea
              rows={3}
              value={newBook.Description}
              onChange={(e) =>
                setNewBook({ ...newBook, Description: e.target.value })
              }
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Tác giả" required>
                <Select
                  mode="multiple"
                  value={newBook.author_ids}
                  onChange={(vals) =>
                    setNewBook({ ...newBook, author_ids: vals })
                  }
                  placeholder="Chọn tác giả"
                >
                  {authors.map((a) => (
                    <Option key={a.author_id} value={a.author_id}>
                      {a.author_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Danh mục">
                <Select
                  value={newBook.category_id}
                  onChange={(v) => setNewBook({ ...newBook, category_id: v })}
                  placeholder="Chọn danh mục"
                >
                  {categories.map((c) => (
                    <Option key={c.category_id} value={c.category_id}>
                      {c.category_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Nhà xuất bản">
                <Select
                  value={newBook.publisher_id}
                  onChange={(v) =>
                    setNewBook({ ...newBook, publisher_id: v })
                  }
                  placeholder="Chọn nhà xuất bản"
                >
                  {publishers.map((p) => (
                    <Option key={p.publisher_id} value={p.publisher_id}>
                      {p.publisher_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Năm xuất bản">
                <Input
                  type="number"
                  value={newBook.PublishYear}
                  onChange={(e) =>
                    setNewBook({
                      ...newBook,
                      PublishYear: parseInt(e.target.value),
                    })
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Ngôn ngữ">
                <Input
                  value={newBook.Language}
                  onChange={(e) =>
                    setNewBook({ ...newBook, Language: e.target.value })
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Loại tài liệu">
                <Input
                  value={newBook.DocumentType}
                  onChange={(e) =>
                    setNewBook({ ...newBook, DocumentType: e.target.value })
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Ảnh bìa">
                <Upload
                  name="file"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  action="/api/upload_file"
                  data={{ tieuChuan: "book", tieuChi: "image" }}
                  onChange={(info) => {
                    if (info.file.status === "done") {
                      setNewBook(prevBook => ({
                        ...prevBook,
                        image: info.file.response.filepath,
                      }));
                      message.success("Upload ảnh thành công");
                    } else if (info.file.status === "error") {
                      message.error("Upload ảnh thất bại");
                    }
                  }}
                >
                  {newBook.image ? (
                    <img
                      src={`/api/get_file?file=${newBook.image}`}
                      alt="avatar"
                      style={{ width: "100%" }}
                    />
                  ) : (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Tài liệu sách (PDF)">
                <Upload
                  name="file"
                  listType="picture-card"
                  className="document-uploader"
                  showUploadList={false}
                  action="/api/upload_file"
                  data={{ tieuChuan: "book", tieuChi: "document" }}
                  onChange={(info) => {
                    if (info.file.status === "done") {
                      setNewBook({
                        ...newBook,
                        document: info.file.response.filepath,
                      });
                      message.success("Upload tài liệu thành công");
                    } else if (info.file.status === "error") {
                      message.error("Upload tài liệu thất bại");
                    }
                  }}
                >
                  {newBook.document ? (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>PDF đã upload</div>
                    </div>
                  ) : (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Upload PDF</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Trạng thái">
            <Select
              value={newBook.IsPublic}
              onChange={(v) => setNewBook({ ...newBook, IsPublic: v })}
            >
              <Option value={1}>Public</Option>
              <Option value={0}>Private</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}