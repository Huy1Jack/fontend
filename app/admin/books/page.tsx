"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Table,
  Button,
  Input,
  Select,
  Card,
  Modal,
  message,
  Form,
  Upload,
  Tag,
  Tooltip,
  Empty,
  Tabs,
  Pagination
} from "antd";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  BookOpen,
  Upload as UploadIcon,
  FileText,
  Eye,
  EyeOff,
  LayoutGrid,
  List as ListIcon,
  CalendarDays,
  Hash,
  Languages
} from "lucide-react";
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
import type { UploadChangeParam } from "antd/es/upload";

const { Option } = Select;

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

// Helper: Resolve Image URL
const resolveImageSrc = (img: string | null) => {
    if (!img) return "/books/default.jpg"; // Ảnh mặc định nếu null
    if (img.startsWith("http")) return img;
    return `/api/get_file?file=${img}`;
};

export default function AdminBooks() {
  const router = useRouter();
  
  // --- State ---
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  
  // Filter State
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState<number | "all">("all");
  const [filterAuthor, setFilterAuthor] = useState<number | "all">("all");

  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentBookId, setCurrentBookId] = useState<number | null>(null);

  // Data Selects
  const [categories, setCategories] = useState<any[]>([]);
  const [publishers, setPublishers] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);

  const [form] = Form.useForm();

  // --- Effects ---
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchBooks(), fetchAuthorsAndCategories(), fetchPublishers()]);
    setLoading(false);
  };

  const fetchBooks = async () => {
    try {
        const token = await getAuthCookie();
        if(!token) return;
        const response = await get_book_admin();
        if (response.success) setBooks(response.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchAuthorsAndCategories = async () => {
    const res = await get_authors_and_categories();
    if(res.success) {
        setAuthors(res.data.authors || []);
        setCategories(res.data.categories || []);
    }
  };

  const fetchPublishers = async () => {
    const res = await get_publishers();
    if(res.success) setPublishers(res.data || []);
  };

  // --- Filter Logic ---
  const filteredBooks = books.filter((book) => {
    const search = searchText.toLowerCase();
    const matchesSearch =
      book.Title.toLowerCase().includes(search) ||
      (book.authors && book.authors.toLowerCase().includes(search)) ||
      (book.ISBN && book.ISBN.includes(search));

    const matchesCategory = filterCategory === "all" || book.category_id === filterCategory;
    const matchesAuthor = filterAuthor === "all" || (book.author_ids && book.author_ids.includes(filterAuthor as number));

    return matchesSearch && matchesCategory && matchesAuthor;
  });

  // --- Handlers ---
  const openAddModal = () => {
    setModalMode('add');
    setCurrentBookId(null);
    form.resetFields();
    // Set default values
    form.setFieldsValue({
        PublishYear: new Date().getFullYear(),
        IsPublic: 1,
        Language: 'Tiếng Việt',
        DocumentType: 'Sách in'
    });
    setIsModalVisible(true);
  };

  const openEditModal = (book: Book) => {
    setModalMode('edit');
    setCurrentBookId(book.books_id);
    
    // Map author_ids logic
    const selectedAuthorIds = book.author_ids && book.author_ids.length > 0 
        ? book.author_ids 
        : authors.filter(a => book.authors?.includes(a.author_name)).map(a => a.author_id);

    form.setFieldsValue({
        ...book,
        author_ids: selectedAuthorIds
    });
    setIsModalVisible(true);
  };

  const handleModalSubmit = async () => {
    try {
        const values = await form.validateFields();
        const token = await getAuthCookie();
        if(!token) return;

        // Chuẩn bị payload
        const bookData = {
            ...values,
            books_id: currentBookId, // Chỉ dùng cho Edit
            author_ids: values.author_ids || []
        };

        let response;
        if(modalMode === 'add') {
             response = await add_book_admin(bookData);
        } else {
             response = await edit_book_admin({
                token,
                api_key: process.env.NEXT_PUBLIC_API_KEY,
                datauser: bookData
             });
        }

        if(response.success) {
            message.success(modalMode === 'add' ? 'Thêm sách thành công' : 'Cập nhật thành công');
            setIsModalVisible(false);
            fetchBooks();
        } else {
            message.error(response.message || 'Thao tác thất bại');
        }

    } catch (e) { console.error(e); }
  };

  const handleDelete = (book: Book) => {
    Modal.confirm({
        title: 'Xác nhận xóa',
        content: `Bạn có chắc muốn xóa sách "${book.Title}"?`,
        okText: 'Xóa',
        okType: 'danger',
        cancelText: 'Hủy',
        centered: true,
        onOk: async () => {
            const res = await del_book_admin({ books_id: book.books_id });
            if(res.success) {
                message.success('Đã xóa sách');
                fetchBooks();
            } else {
                message.error(res.message);
            }
        }
    });
  };

  // --- Upload Handlers ---
  const handleUploadChange = (info: UploadChangeParam, field: string) => {
      if (info.file.status === 'done') {
          message.success(`${field === 'image' ? 'Ảnh' : 'File'} tải lên thành công`);
          form.setFieldValue(field, info.file.response.filepath);
      } else if (info.file.status === 'error') {
          message.error('Tải lên thất bại');
      }
  };

  // --- Render Components ---

  // 1. Grid View Card Component
  const BookGridCard = ({ book }: { book: Book }) => (
      <div className="group bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
          {/* Status Badge */}
          <div className={`absolute top-4 right-4 z-10 px-2 py-1 rounded-full text-xs font-bold ${book.IsPublic ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
              {book.IsPublic ? 'Public' : 'Private'}
          </div>

          {/* Image */}
          <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden mb-4 bg-gray-50 shadow-inner">
             <Image 
                src={resolveImageSrc(book.image)}
                alt={book.Title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
             />
             {/* Overlay Actions */}
             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                <Button 
                    type="primary" shape="circle" icon={<Edit size={16} />} 
                    onClick={() => openEditModal(book)}
                    className="bg-indigo-500 border-indigo-500 hover:bg-indigo-600"
                />
                <Button 
                    type="primary" shape="circle" danger icon={<Trash2 size={16} />} 
                    onClick={() => handleDelete(book)}
                />
             </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
             <h3 className="font-bold text-gray-800 line-clamp-2 mb-1 min-h-[40px]" title={book.Title}>{book.Title}</h3>
             <p className="text-sm text-gray-500 mb-2 line-clamp-1">{book.authors || 'Chưa rõ tác giả'}</p>
             
             <div className="mt-auto flex items-center justify-between">
                <Tag color="blue" className="rounded-md border-0 bg-blue-50 text-blue-600 m-0 text-xs">
                    {book.category_name || 'Khác'}
                </Tag>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">
                    {book.PublishYear || 'N/A'}
                </span>
             </div>
          </div>
      </div>
  );

  // 2. Table Columns
  const columns = [
    {
        title: 'Bìa sách',
        dataIndex: 'image',
        key: 'image',
        width: 80,
        render: (img: string) => (
            <div className="relative w-12 h-16 rounded-md overflow-hidden shadow-sm border border-gray-100">
                <Image src={resolveImageSrc(img)} alt="cover" fill className="object-cover" sizes="50px" />
            </div>
        )
    },
    {
        title: 'Thông tin sách',
        dataIndex: 'Title',
        key: 'Title',
        render: (text: string, record: Book) => (
            <div>
                <div className="font-bold text-gray-800 text-base mb-1 hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => openEditModal(record)}>{text}</div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{record.authors || 'No Author'}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs">{record.PublishYear}</span>
                </div>
            </div>
        )
    },
    {
        title: 'Danh mục',
        dataIndex: 'category_name',
        key: 'category_name',
        width: 150,
        render: (cat: string) => <Tag color="geekblue" className="rounded-full px-3 bg-indigo-50 text-indigo-600 border-0">{cat}</Tag>
    },
    {
        title: 'Trạng thái',
        dataIndex: 'IsPublic',
        key: 'IsPublic',
        width: 120,
        render: (val: number) => (
            <div className={`flex items-center gap-1.5 text-sm font-medium ${val ? 'text-emerald-600' : 'text-gray-500'}`}>
                {val ? <Eye size={16} /> : <EyeOff size={16} />}
                {val ? 'Công khai' : 'Riêng tư'}
            </div>
        )
    },
    {
        title: '',
        key: 'actions',
        width: 100,
        render: (_: any, record: Book) => (
            <div className="flex justify-end gap-2">
                <Button type="text" shape="circle" icon={<Edit size={18} className="text-blue-500" />} onClick={() => openEditModal(record)} className="hover:bg-blue-50" />
                <Button type="text" shape="circle" danger icon={<Trash2 size={18} />} onClick={() => handleDelete(record)} className="hover:bg-red-50" />
            </div>
        )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-6">
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                    <BookOpen className="text-indigo-600" /> Quản lý Sách
                </h1>
                <p className="text-gray-500 mt-1 text-sm">Kho lưu trữ tài liệu kỹ thuật số và sách in</p>
            </div>
            <div className="flex items-center gap-3 bg-white p-1 rounded-full border border-gray-200 shadow-sm">
                <Button 
                    type={viewMode === 'table' ? 'primary' : 'text'} 
                    shape="circle" 
                    icon={<ListIcon size={18} />} 
                    onClick={() => setViewMode('table')}
                    className={viewMode === 'table' ? 'bg-indigo-600' : 'text-gray-500'}
                />
                <Button 
                    type={viewMode === 'grid' ? 'primary' : 'text'} 
                    shape="circle" 
                    icon={<LayoutGrid size={18} />} 
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-indigo-600' : 'text-gray-500'}
                />
                <div className="w-px h-6 bg-gray-200 mx-1"></div>
                <Button 
                    type="primary" 
                    icon={<Plus size={18} />} 
                    onClick={openAddModal}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0 rounded-full h-9 px-5 shadow-md hover:shadow-lg transition-all"
                >
                    Thêm sách
                </Button>
            </div>
        </div>

        {/* --- Filters --- */}
        <Card bordered={false} className="shadow-sm rounded-xl overflow-hidden">
             <div className="flex flex-col md:flex-row gap-4 p-1">
                <div className="flex-1 relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <Input 
                        placeholder="Tìm kiếm sách, tác giả, ISBN..." 
                        className="pl-10 h-10 rounded-lg border-gray-200 hover:border-indigo-400 focus:border-indigo-500"
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
                <Select 
                    defaultValue="all" 
                    className="w-full md:w-48 h-10"
                    onChange={setFilterCategory}
                    suffixIcon={<Filter size={14} />}
                    options={[{value: 'all', label: 'Tất cả danh mục'}, ...categories.map(c => ({value: c.category_id, label: c.category_name}))]}
                />
                 <Select 
                    defaultValue="all" 
                    className="w-full md:w-48 h-10"
                    onChange={setFilterAuthor}
                    showSearch
                    optionFilterProp="label"
                    options={[{value: 'all', label: 'Tất cả tác giả'}, ...authors.map(a => ({value: a.author_id, label: a.author_name}))]}
                />
             </div>
        </Card>

        {/* --- Content --- */}
        {loading ? (
            <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        ) : filteredBooks.length === 0 ? (
            <Empty description="Không tìm thấy sách nào" className="mt-20" />
        ) : (
            <>
                {viewMode === 'table' ? (
                     <Card bordered={false} className="shadow-lg shadow-gray-200/50 rounded-2xl overflow-hidden" bodyStyle={{ padding: 0 }}>
                        <Table 
                            columns={columns} 
                            dataSource={filteredBooks} 
                            rowKey="books_id" 
                            pagination={{ pageSize: 8, className: "p-4" }}
                            className="custom-table"
                        />
                     </Card>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {filteredBooks.map(book => (
                            <BookGridCard key={book.books_id} book={book} />
                        ))}
                    </div>
                )}
            </>
        )}

        {/* --- ADD / EDIT MODAL --- */}
        <Modal
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            onOk={handleModalSubmit}
            title={
                <div className="flex items-center gap-2 text-xl font-bold text-gray-800 pb-2 border-b border-gray-100">
                    {modalMode === 'add' ? <Plus className="text-indigo-600" /> : <Edit className="text-indigo-600" />}
                    {modalMode === 'add' ? "Thêm sách mới" : "Chỉnh sửa thông tin"}
                </div>
            }
            width={900}
            centered
            okText={modalMode === 'add' ? "Thêm ngay" : "Lưu thay đổi"}
            cancelText="Hủy bỏ"
            okButtonProps={{ className: 'bg-indigo-600 h-10 px-6 rounded-lg' }}
            cancelButtonProps={{ className: 'h-10 px-6 rounded-lg' }}
            className="rounded-2xl"
        >
            <Form form={form} layout="vertical" className="pt-6">
                <div className="grid grid-cols-12 gap-6">
                    {/* Left Column: Main Info */}
                    <div className="col-span-12 md:col-span-8 space-y-4">
                        <Form.Item name="Title" label="Tiêu đề sách" rules={[{ required: true, message: "Nhập tên sách" }]}>
                            <Input size="large" className="rounded-lg font-medium" placeholder="Ví dụ: Đắc Nhân Tâm" />
                        </Form.Item>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item name="category_id" label="Danh mục">
                                <Select size="large" options={categories.map(c => ({ value: c.category_id, label: c.category_name }))} placeholder="Chọn danh mục" />
                            </Form.Item>
                            <Form.Item name="author_ids" label="Tác giả" rules={[{ required: true }]}>
                                <Select mode="multiple" size="large" options={authors.map(a => ({ value: a.author_id, label: a.author_name }))} placeholder="Chọn tác giả" maxTagCount={2} />
                            </Form.Item>
                        </div>

                        <Form.Item name="Description" label="Mô tả tóm tắt">
                            <Input.TextArea rows={4} className="rounded-lg" placeholder="Nội dung chính của sách..." />
                        </Form.Item>

                        <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                             <Form.Item name="PublishYear" label="Năm XB" className="mb-0">
                                <Input prefix={<CalendarDays size={14} className="text-gray-400"/>} type="number" className="rounded-lg" />
                             </Form.Item>
                             <Form.Item name="ISBN" label="ISBN" className="mb-0">
                                <Input prefix={<Hash size={14} className="text-gray-400"/>} className="rounded-lg" />
                             </Form.Item>
                             <Form.Item name="Language" label="Ngôn ngữ" className="mb-0">
                                <Input prefix={<Languages size={14} className="text-gray-400"/>} className="rounded-lg" />
                             </Form.Item>
                        </div>
                    </div>

                    {/* Right Column: Files & Status */}
                    <div className="col-span-12 md:col-span-4 flex flex-col gap-4">
                         {/* Image Upload */}
                         <Form.Item name="image" noStyle>
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-indigo-400 transition-colors bg-white">
                                <div className="relative w-full aspect-[2/3] bg-gray-50 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                                    <Form.Item shouldUpdate={(prev, curr) => prev.image !== curr.image} noStyle>
                                        {({ getFieldValue }) => {
                                            const img = getFieldValue('image');
                                            return img ? (
                                                <Image src={resolveImageSrc(img)} alt="preview" fill className="object-cover" />
                                            ) : (
                                                <div className="text-gray-300"><Image size={40} className="mx-auto" /></div>
                                            );
                                        }}
                                    </Form.Item>
                                </div>
                                <Upload 
                                    showUploadList={false} 
                                    action="/api/upload_file" 
                                    data={{ tieuChuan: "book", tieuChi: "image" }}
                                    onChange={(info) => handleUploadChange(info, 'image')}
                                >
                                    <Button icon={<UploadIcon size={14} />} size="small" className="rounded-full">Tải ảnh bìa</Button>
                                </Upload>
                            </div>
                         </Form.Item>

                         {/* PDF Upload */}
                         <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <div className="flex items-center gap-2 mb-2 text-blue-800 font-medium">
                                <FileText size={18} /> Tài liệu PDF
                            </div>
                            <Form.Item name="document" noStyle>
                                <Input type="hidden" />
                            </Form.Item>
                             <Upload 
                                    showUploadList={false} 
                                    action="/api/upload_file" 
                                    data={{ tieuChuan: "book", tieuChi: "document" }}
                                    onChange={(info) => handleUploadChange(info, 'document')}
                                >
                                    <Button block icon={<UploadIcon size={14} />} className="rounded-lg border-blue-200 text-blue-600 hover:text-blue-700 hover:border-blue-300">
                                        Upload PDF
                                    </Button>
                                </Upload>
                         </div>

                         {/* Status */}
                         <Form.Item name="IsPublic" label="Trạng thái hiển thị">
                            <Select size="large" className="w-full">
                                <Option value={1}><div className="flex items-center gap-2"><Eye size={16} className="text-emerald-500"/> Công khai</div></Option>
                                <Option value={0}><div className="flex items-center gap-2"><EyeOff size={16} className="text-gray-400"/> Riêng tư</div></Option>
                            </Select>
                         </Form.Item>
                         
                         <Form.Item name="publisher_id" label="Nhà xuất bản">
                             <Select size="large" options={publishers.map(p => ({ value: p.publisher_id, label: p.publisher_name }))} placeholder="Chọn NXB" />
                         </Form.Item>
                    </div>
                </div>
            </Form>
        </Modal>
    </div>
  );
}