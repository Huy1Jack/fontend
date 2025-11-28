'use client'

import React, { useState, useEffect } from 'react'
import { Book } from '../../lib/types'
import { show_books, show_book_search, add_book_review, edit_book_admin } from "@/app/actions/generalActions"
import Image from 'next/image'
import Link from 'next/link'
import Head from 'next/head'
import { useAuth } from '@/lib/hooks/useAuth'
import { useSearchParams } from 'next/navigation'

// ==============================
// 🎨 Import Ant Design
// ==============================
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Button,
  Spin,
  Result,
  Typography,
  Tag,
  Empty,
  Space,
  Modal,
  Rate,
  Form,
  Input as AntInput
} from 'antd'
import {
  SearchOutlined,
  FilterOutlined,
  RedoOutlined,
  LoadingOutlined
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { Meta } = Card

interface FilterOptions {
  author: string
  documentType: string
  category: string
  search: string
}

const BooksPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const [form] = Form.useForm()
  const [reviewModalVisible, setReviewModalVisible] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [filters, setFilters] = useState<FilterOptions>({
    author: '',
    documentType: '',
    category: '',
    search: ''
  })
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search') || ''
  // ==============================
  // 🧩 Xử lý hình ảnh sách
  // ==============================
  const resolveImageSrc = (book: Book): string => {
    const raw = book.coverUrl || '/logo/logo.svg'
    if (!raw || typeof raw !== 'string') return '/logo/logo.svg'
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
    if (raw.startsWith('data:')) return raw
    if (raw.startsWith('/')) return raw
    return `/api/get_file?file=${raw}`
  }

  // ==============================
  // 📚 Lấy danh sách tất cả sách
  // ==============================
  const fetchBooks = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await show_books()
      if (response.success) {
        const list: Book[] = (response.data || []).map((b: any) => ({
          id: String(b.books_id ?? b.id ?? crypto.randomUUID()),
          title: b.Title ?? '',
          author: b.Author ?? '',
          publisher: b.Publisher ?? '',
          publishYear: b.PublishYear ?? 0,
          isbn: b.ISBN ?? '',
          category: b.Category ?? '',
          description: b.Description ?? '',
          coverUrl: b.image ?? '/logo/logo.svg',
          DocumentType: b.DocumentType ?? '',
          books_id: b.books_id,
          file: b.file
        }))
        setBooks(list)
        setFilteredBooks(list)
      } else {
        setError(response.message || 'Không thể tải danh sách sách')
      }
    } catch (err) {
      setError('Lỗi kết nối đến server')
      console.error('Error fetching books:', err)
    } finally {
      setLoading(false)
    }
  }

  // ==============================
  // 🧠 Lọc sách tại frontend
  // ==============================
  const filterBooks = () => {
    let filtered = [...books]

    if (filters.search) {
      filtered = filtered.filter(book =>
        (book.title || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (book.Title || '').toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    if (filters.author) {
      filtered = filtered.filter(book =>
        (book.author || '').toLowerCase() === filters.author.toLowerCase()
      )
    }

    if (filters.category) {
      filtered = filtered.filter(book =>
        (book.category || '').toLowerCase() === filters.category.toLowerCase()
      )
    }

    if (filters.documentType) {
      filtered = filtered.filter(book =>
        (book.DocumentType || '').toLowerCase() === filters.documentType.toLowerCase()
      )
    }

    setFilteredBooks(filtered)
  }

  // ==============================
  // 🔍 Gọi API tìm kiếm khi có query từ Header
  // ==============================
  useEffect(() => {
    const fetchSearch = async () => {
      setError(null)
      setLoading(true)
      try {
        if (searchQuery.trim()) {
          const res = await show_book_search(searchQuery)
          if (res.success && Array.isArray(res.books)) {
            const list: Book[] = res.books.map((b: any) => ({
              id: String(b.books_id ?? crypto.randomUUID()),
              title: b.Title ?? '',
              author: b.Author ?? '',
              publisher: b.Publisher ?? '',
              publishYear: b.PublishYear ?? 0,
              category: b.Category ?? '',
              coverUrl: b.image ?? '/logo/logo.svg',
              DocumentType: b.DocumentType ?? '',
              books_id: b.books_id,
              file: b.file
            }))
            setBooks(list)
            setFilteredBooks(list)
          } else {
            setBooks([])
            setFilteredBooks([])
          }
        } else {
          await fetchBooks()
        }
      } catch (err) {
        console.error('Search error:', err)
        setError('Lỗi khi tìm kiếm sách')
      } finally {
        setLoading(false)
      }
    }

    fetchSearch()
  }, [searchQuery])

  // ==============================
  // 🔄 Lọc sách khi filter thay đổi
  // ==============================
  useEffect(() => {
    filterBooks()
  }, [filters, books])

  // ==============================
  // 🔁 Reset filter
  // ==============================
  const resetFilters = () => {
    setFilters({ author: '', documentType: '', category: '', search: '' })
    setFilteredBooks(books)
  }

  // ==============================
  // ⏳ Loading UI (Đã sửa Dark Mode)
  // ==============================
  if (loading) {
    return (
      // Đã bỏ 'background: #f0f2f5'
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
        <Text style={{ marginLeft: 16, fontSize: 18 }}>Đang tải danh sách sách...</Text>
      </div>
    )
  }

  // ==============================
  // ❌ Error UI (Đã sửa Dark Mode)
  // ==============================
  if (error) {
    return (
      // Đã bỏ 'background: #f0f2f5'
      <div style={{ minHeight: '100vh', paddingTop: 48 }}>
        <Result
          status="error"
          title="Lỗi tải dữ liệu"
          subTitle={error}
          extra={
            <Button type="primary" onClick={fetchBooks} icon={<RedoOutlined />}>
              Thử lại
            </Button>
          }
        />
      </div>
    )
  }

  // Lấy danh sách duy nhất cho bộ lọc
  const authors = Array.from(new Set(books.map(b => b.author).filter(Boolean))).sort()
  const categories = Array.from(new Set(books.map(b => b.category).filter(Boolean))).sort()
  const documentTypes = Array.from(new Set(books.map(b => b.DocumentType || '').filter(Boolean))).sort()

  // ==============================
  // 🖼️ Giao diện chính (Đã sửa Dark Mode)
  // ==============================
  return (
    // Đã bỏ 'background: #f0f2f5'
    <div style={{ minHeight: '100vh' }}>
      <Head>
        <title>Thư viện Sách | Khám phá và Tìm kiếm</title>
      </Head>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px' }}>
        <Title level={2}>Thư viện Sách</Title>
        <Paragraph type="secondary" style={{ marginBottom: 24 }}>Khám phá và tìm kiếm hàng trăm đầu sách.</Paragraph>

        {/* Bộ lọc */}
        <Card style={{ marginBottom: 24 }}>
          <Space align="center" style={{ marginBottom: 16 }}>
            <FilterOutlined style={{ color: '#1890ff' }} />
            <Title level={4} style={{ margin: 0 }}>Bộ lọc tìm kiếm</Title>
          </Space>

          <Row gutter={[16, 16]} align="bottom">
            {/* Ô tìm kiếm tên sách */}
            <Col xs={24} sm={12} md={8} lg={6}>
              <Text strong>Tên sách</Text>
              <Input
                prefix={<SearchOutlined />}
                placeholder="Tìm kiếm tên sách..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                allowClear
              />
            </Col>

            {/* Bộ lọc tác giả */}
            <Col xs={24} sm={12} md={8} lg={5}>
              <Text strong>Tác giả</Text>
              <Select
                value={filters.author || ''}
                onChange={(value) => setFilters(prev => ({ ...prev, author: value }))}
                style={{ width: '100%' }}
              >
                <Option value="">Tất cả tác giả</Option>
                {authors.map(author => (
                  <Option key={author} value={author}>{author}</Option>
                ))}
              </Select>
            </Col>

            {/* Bộ lọc thể loại (category) */}
            <Col xs={24} sm={12} md={8} lg={5}>
              <Text strong>Thể loại</Text>
              <Select
                value={filters.category || ''}
                onChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                style={{ width: '100%' }}
              >
                <Option value="">Tất cả thể loại</Option>
                {categories.map(category => (
                  <Option key={category} value={category}>{category}</Option>
                ))}
              </Select>
            </Col>

            {/* Bộ lọc loại tài liệu (DocumentType) */}
            <Col xs={24} sm={12} md={8} lg={5}>
              <Text strong>Loại tài liệu</Text>
              <Select
                value={filters.documentType || ''}
                onChange={(value) => setFilters(prev => ({ ...prev, documentType: value }))}
                style={{ width: '100%' }}
              >
                <Option value="">Tất cả loại sách</Option>
                {documentTypes.map(dt => (
                  <Option key={dt} value={dt}>{dt}</Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} sm={12} md={8} lg={3}>
              <Button onClick={resetFilters} icon={<RedoOutlined />} style={{ width: '100%' }}>
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>

          <div style={{ marginTop: 16 }}>
            <Text type="secondary">
              Hiển thị {filteredBooks.length} / {books.length} sách
            </Text>
          </div>
        </Card>

        {/* Danh sách sách */}
        {filteredBooks.length > 0 ? (
          <Row gutter={[16, 24]}>
            {filteredBooks.map((book) => (
              <Col xs={24} sm={12} md={8} lg={6} key={book.id}>
                <Card
                  hoverable
                  cover={
                    // ✅ YÊU CẦU: Click vào ảnh để xem chi tiết
                    <Link href={`/books/details?books_id=${book.books_id ?? book.id}`} >
                      {/* Đã bỏ 'background: #f0f0f0' để sửa lỗi Dark Mode */}
                      <div style={{ position: 'relative', height: 300 }}>
                        <Image
                          alt={book.Title || book.title || 'Book cover'}
                          src={resolveImageSrc(book)}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                    </Link>
                  }
                  actions={[
                    // ✅ YÊU CẦU: Bỏ "Xem file", chỉ giữ "Xem chi tiết"
                    <Link href={`/books/details?books_id=${book.books_id ?? book.id}`} key="details" >
                      Xem chi tiết
                    </Link>
                  ]}
                >
                  <Meta
                    title={
                      <Link href={`/books/details?books_id=${book.books_id ?? book.id}`} style={{ color: 'inherit' }}>
                        <Text style={{ fontSize: 16 }} strong ellipsis={{ tooltip: book.Title || book.title }}>
                          {book.Title || book.title}
                        </Text>
                      </Link>
                    }
                    description={`Tác giả: ${book.author || '—'}`}
                  />
                  <div style={{ marginTop: 12, minHeight: 80 }}>
                    <Text type="secondary" style={{ display: 'block' }}>
                      NXB: {book.publisher || '—'}
                    </Text>
                    <Text type="secondary" style={{ display: 'block' }}>
                      Năm: {book.publishYear || '—'}
                    </Text>
                    <Space wrap size={[0, 8]} style={{ marginTop: 8 }}>
                      {book.category && <Tag color="blue">{book.category}</Tag>}
                      {book.DocumentType && <Tag color="green">{book.DocumentType}</Tag>}
                    </Space>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="Không tìm thấy sách phù hợp với tiêu chí tìm kiếm." />
        )}
      </div>
    </div>
  )
}

export default BooksPage