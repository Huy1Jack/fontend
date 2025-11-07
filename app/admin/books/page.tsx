"use client";
import { useEffect, useState } from 'react';
import { Table, Space, Button, Input, Select, Card, Modal, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { get_book_admin, del_book_admin, edit_book_admin, get_authors_and_categories, get_publishers } from '@/app/sever/admin/route';
import { useRouter } from 'next/navigation';
import { getAuthCookie } from "@/app/sever/authcookie/route";
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
  IsPublic: number;
  UploadDate: string;
  UploadedBy: string;
  category_name: string;
  publisher_name: string;
  authors: string;
}

export default function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [filterDocType, setFilterDocType] = useState('all');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [publishers, setPublishers] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const router = useRouter();
  const fetchAuthorsAndCategories = async () => {
    try {
      const response = await get_authors_and_categories();
      if (response.success && response.data) {
        setAuthors(response.data.authors || []);
        setCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching authors and categories:', error);
    }
  };

  const fetchPublishers = async () => {
    try {
      const response = await get_publishers();
      if (response.success && response.data) {
        setPublishers(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching publishers:', error);
    }
  };

  useEffect(() => {
    fetchBooks();
    Check_user();
    fetchAuthorsAndCategories();
    fetchPublishers();
  }, []);

  const fetchBooks = async () => {
    try {
      const token = await getAuthCookie();
      if (!token) {
        message.error('Bạn chưa đăng nhập');
        router.push('/');
        return;
      }

      const response = await get_book_admin({
        token: token,
        api_key: process.env.NEXT_PUBLIC_API_KEY
      });

      if (response.success && response.data) {
        setBooks(response.data);
      } else {
        message.error(response.message || 'Failed to fetch books');
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      message.error('Đã xảy ra lỗi khi tải danh sách sách');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: Book) => {
    setEditingBook(record);
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    if (!editingBook) return;

    try {
      const dataUser = {
        books_id: editingBook.books_id,
        Title: editingBook.Title,
        Description: editingBook.Description,
        ISBN: editingBook.ISBN,
        PublishYear: editingBook.PublishYear,
        Language: editingBook.Language,
        DocumentType: editingBook.DocumentType,
        IsPublic: editingBook.IsPublic,
        category_name: editingBook.category_name,
        publisher_name: editingBook.publisher_name,
        authors: editingBook.authors,
        image: editingBook.image
      };

      const response = await edit_book_admin(dataUser);
      if (response.success) {
        message.success('Cập nhật sách thành công');
        setIsEditModalVisible(false);
        fetchBooks(); // Refresh the book list
      } else {
        message.error(response.message || 'Không thể cập nhật sách');
      }
    } catch (error) {
      console.error('Error updating book:', error);
      message.error('Đã xảy ra lỗi khi cập nhật sách');
    }
  };

  const handleDelete = (record: Book) => {
    
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa sách này?',
      content: `Sách: ${record.Title}`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const response = await del_book_admin({ books_id: record.books_id });
          if (response.success) {
            message.success(`Đã xóa sách: ${record.Title}`);
            // Refresh the book list after successful deletion
            fetchBooks();
          } else {
            message.error('Không thể xóa sách. Vui lòng thử lại!');
          }
        } catch (error) {
          message.error('Đã xảy ra lỗi khi xóa sách!');
        }
      },
    });
  };

  const Check_user = async () => {
    try {
      const token = await getAuthCookie();
      if (!token) {
        message.error("Bạn chưa đăng nhập");
        router.push('/');
        return;
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      if ((payload.role === 1) || (payload.role === 2)) {
        // User has permission, continue
      } else {
        message.error("Bạn không có quyền truy cập trang này");
        router.push('/');
      }
    } catch (error: any) {
      console.error('Error checking user:', error);
      message.error("Máy chủ không phản hồi");
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    router.push('/admin/books/add');
    
    message.info('Thêm mới sách');
  };

  // Get unique languages and document types for filters
  const languages = Array.from(new Set(books.map(book => book.Language)));
  const documentTypes = Array.from(new Set(books.map(book => book.DocumentType)));

  const filteredBooks = books.filter(book => {
    const searchLower = searchText.toLowerCase();
    const matchesSearch = 
      book.Title.toLowerCase().includes(searchLower) ||
      book.Description.toLowerCase().includes(searchLower) ||
      book.ISBN.toLowerCase().includes(searchLower) ||
      book.authors?.toLowerCase().includes(searchLower) ||
      book.category_name?.toLowerCase().includes(searchLower) ||
      book.publisher_name?.toLowerCase().includes(searchLower);
    const matchesLanguage = filterLanguage === 'all' || book.Language === filterLanguage;
    const matchesDocType = filterDocType === 'all' || book.DocumentType === filterDocType;
    return matchesSearch && matchesLanguage && matchesDocType;
  });

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image: string) => (
        <img 
          src={image ? `/books/${image}` : '/books/default.jpg'} 
          alt="Book cover" 
          style={{ 
            width: 70, 
            height: 100, 
            objectFit: 'cover',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }} 
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/books/default.jpg';
          }}
        />
      ),
    },
    {
      title: 'Title',
      dataIndex: 'Title',
      key: 'Title',
      width: 200,
      sorter: (a: Book, b: Book) => a.Title.localeCompare(b.Title),
      render: (text: string, record: Book) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.Description}</div>
        </div>
      ),
    },
    {
      title: 'ISBN',
      dataIndex: 'ISBN',
      key: 'ISBN',
      width: 120,
    },
    {
      title: 'Authors',
      dataIndex: 'authors',
      key: 'authors',
      width: 200,
      render: (authors: string) => (
        <div style={{ whiteSpace: 'pre-wrap' }}>
          {authors?.split(', ').map((author: string, index: number) => (
            <div key={index}>{author}</div>
          ))}
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category_name',
      key: 'category_name',
      width: 120,
    },
    {
      title: 'Publisher',
      dataIndex: 'publisher_name',
      key: 'publisher_name',
      width: 150,
    },
    {
      title: 'Language',
      dataIndex: 'Language',
      key: 'Language',
      width: 100,
    },
    {
      title: 'Document Type',
      dataIndex: 'DocumentType',
      key: 'DocumentType',
      width: 120,
    },
    {
      title: 'Publish Year',
      dataIndex: 'PublishYear',
      key: 'PublishYear',
      width: 100,
      sorter: (a: Book, b: Book) => a.PublishYear - b.PublishYear,
    },
    {
      title: 'Upload Info',
      key: 'uploadInfo',
      width: 200,
      render: (_, record: Book) => (
        <div>
          <div>By: {record.UploadedBy}</div>
          <div>Date: {new Date(record.UploadDate).toLocaleDateString('vi-VN')}</div>
          <div>Status: {record.IsPublic ? 'Public' : 'Private'}</div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as const,
      width: 150,
      render: (_: any, record: Book) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title="QUẢN LÝ SÁCH" extra={
      <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
        Thêm sách
      </Button>
    }>
      <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
        <Space>
          <Search
            placeholder="Search books..."
            allowClear
            style={{ width: 300 }}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            style={{ width: 200 }}
            placeholder="Filter by language"
            onChange={(value) => setFilterLanguage(value)}
            defaultValue="all"
          >
            <Option value="all">All Languages</Option>
            {languages.map(lang => (
              <Option key={lang} value={lang}>{lang}</Option>
            ))}
          </Select>
          <Select
            style={{ width: 200 }}
            placeholder="Filter by document type"
            onChange={(value) => setFilterDocType(value)}
            defaultValue="all"
          >
            <Option value="all">All Types</Option>
            {documentTypes.map(type => (
              <Option key={type} value={type}>{type}</Option>
            ))}
          </Select>
        </Space>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredBooks}
        rowKey="books_id"
        loading={loading}
        scroll={{ x: 1500 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} books`,
        }}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ padding: '20px' }}>
              <h4>Description</h4>
              <p>{record.Description}</p>
            </div>
          ),
        }}
      />

      <Modal
        title="Chỉnh sửa thông tin sách"
        open={isEditModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setIsEditModalVisible(false)}
        width={800}
      >
        {editingBook && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label>Tiêu đề:</label>
              <Input
                value={editingBook.Title}
                onChange={(e) => setEditingBook({ ...editingBook, Title: e.target.value })}
              />
            </div>
            <div>
              <label>Mô tả:</label>
              <Input.TextArea
                value={editingBook.Description}
                onChange={(e) => setEditingBook({ ...editingBook, Description: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <label>ISBN:</label>
              <Input
                value={editingBook.ISBN}
                onChange={(e) => setEditingBook({ ...editingBook, ISBN: e.target.value })}
              />
            </div>
            <div>
              <label>Năm xuất bản:</label>
              <Input
                type="number"
                value={editingBook.PublishYear}
                onChange={(e) => setEditingBook({ ...editingBook, PublishYear: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label>Ngôn ngữ:</label>
              <Input
                value={editingBook.Language}
                onChange={(e) => setEditingBook({ ...editingBook, Language: e.target.value })}
              />
            </div>
            <div>
              <label>Loại tài liệu:</label>
              <Input
                value={editingBook.DocumentType}
                onChange={(e) => setEditingBook({ ...editingBook, DocumentType: e.target.value })}
              />
            </div>
            <div>
              <label>Danh mục:</label>
              <Select
                value={editingBook.category_name}
                onChange={(value) => setEditingBook({ ...editingBook, category_name: value })}
                style={{ width: '100%' }}
              >
                {categories.map(category => (
                  <Option key={category.category_id} value={category.category_name}>
                    {category.category_name}
                  </Option>
                ))}
              </Select>
            </div>
            <div>
              <label>Nhà xuất bản:</label>
              <Select
                value={editingBook.publisher_name}
                onChange={(value) => setEditingBook({ ...editingBook, publisher_name: value })}
                style={{ width: '100%' }}
              >
                {publishers.map(publisher => (
                  <Option key={publisher.publisher_id} value={publisher.publisher_name}>
                    {publisher.publisher_name}
                  </Option>
                ))}
              </Select>
            </div>
            <div>
              <label>Tác giả:</label>
              <Select
                mode="multiple"
                value={editingBook.authors ? editingBook.authors.split(', ') : []}
                onChange={(values) => setEditingBook({ ...editingBook, authors: values.join(', ') })}
                style={{ width: '100%' }}
                placeholder="Chọn tác giả"
                optionFilterProp="children"
              >
                {authors.map(author => (
                  <Option key={author.author_id} value={author.author_name}>
                    {author.author_name}
                  </Option>
                ))}
              </Select>
            </div>
            <div>
              <label>Trạng thái:</label>
              <Select
                value={editingBook.IsPublic}
                onChange={(value) => setEditingBook({ ...editingBook, IsPublic: value })}
                style={{ width: '100%' }}
              >
                <Option value={1}>Public</Option>
                <Option value={0}>Private</Option>
              </Select>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
}
