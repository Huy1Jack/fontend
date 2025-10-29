"use client";
import { useEffect, useState } from 'react';
import { Table, Space, Button, Input, Select, Card, Modal, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { get_book_admin, del_book_admin } from '@/app/sever/admin/route';
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
  rate: number;
  category_id: number;
  author_id: number | null;
  publisher_id: number;
  email: string | null;
}

export default function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [filterDocType, setFilterDocType] = useState('all');
  const router = useRouter();
  useEffect(() => {
    fetchBooks();
    Check_user();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await get_book_admin();
      if (response.success && response.data) {
        setBooks(response.data);
      }
    } catch (error) {
      message.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: Book) => {
    // TODO: Implement edit functionality
    message.info(`Editing book: ${record.Title}`);
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
      const payload = JSON.parse(atob(token.split('.')[1]));
      if ((payload.role == 1) || (payload.role == 2)) {
      } else {
        message.error("Bạn không có quyền truy cập trang này");
        router.push('/');
      }
    } catch (error: any) {
      message.error("Máy chủ không phản hồi");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    router.push('/admin/books/add');
    
    message.info('Add new book');
  };

  // Get unique languages and document types for filters
  const languages = Array.from(new Set(books.map(book => book.Language)));
  const documentTypes = Array.from(new Set(books.map(book => book.DocumentType)));

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.Title.toLowerCase().includes(searchText.toLowerCase()) ||
      book.Description.toLowerCase().includes(searchText.toLowerCase());
    const matchesLanguage = filterLanguage === 'all' || book.Language === filterLanguage;
    const matchesDocType = filterDocType === 'all' || book.DocumentType === filterDocType;
    return matchesSearch && matchesLanguage && matchesDocType;
  });

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image: string) => (
        <img src={`/${image}`} alt="Book cover" style={{ width: 50, height: 70, objectFit: 'cover' }} />
      ),
    },
    {
      title: 'Title',
      dataIndex: 'Title',
      key: 'Title',
      sorter: (a: Book, b: Book) => a.Title.localeCompare(b.Title),
    },
    {
      title: 'Language',
      dataIndex: 'Language',
      key: 'Language',
    },
    {
      title: 'Document Type',
      dataIndex: 'DocumentType',
      key: 'DocumentType',
    },
    {
      title: 'Publish Year',
      dataIndex: 'PublishYear',
      key: 'PublishYear',
      sorter: (a: Book, b: Book) => a.PublishYear - b.PublishYear,
    },
    {
      title: 'Rating',
      dataIndex: 'rate',
      key: 'rate',
      sorter: (a: Book, b: Book) => a.rate - b.rate,
    },
    {
      title: 'Actions',
      key: 'actions',
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
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} books`,
        }}
      />
    </Card>
  );
}
