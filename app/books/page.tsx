'use client'

import React, { useState, useEffect } from 'react'
import { Book } from '../../lib/types'
import { show_books, show_book_search, add_book_review, edit_book_admin } from "@/app/actions/generalActions"
import Image from 'next/image'
import Link from 'next/link'
import Head from 'next/head'
import { useAuth } from '@/lib/hooks/useAuth'
import { useSearchParams } from 'next/navigation'

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
  Input as AntInput,
  Badge,
  Divider
} from 'antd'
import {
  SearchOutlined,
  FilterOutlined,
  RedoOutlined,
  LoadingOutlined,
  BookOutlined,
  UserOutlined,
  CalendarOutlined,
  AppstoreOutlined
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

  const resolveImageSrc = (book: Book): string => {
    const raw = book.coverUrl || '/logo/logo.svg'
    if (!raw || typeof raw !== 'string') return '/logo/logo.svg'
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
    if (raw.startsWith('data:')) return raw
    if (raw.startsWith('/')) return raw
    return `/api/get_file?file=${raw}`
  }

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

  useEffect(() => {
    filterBooks()
  }, [filters, books])

  const resetFilters = () => {
    setFilters({ author: '', documentType: '', category: '', search: '' })
    setFilteredBooks(books)
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        gap: '16px'
      }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} spin />} />
        <Text style={{ fontSize: 18, fontWeight: 500 }}>Đang tải danh sách sách...</Text>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: 48 }}>
        <Result
          status="error"
          title="Lỗi tải dữ liệu"
          subTitle={error}
          extra={
            <Button type="primary" size="large" onClick={fetchBooks} icon={<RedoOutlined />}>
              Thử lại
            </Button>
          }
        />
      </div>
    )
  }

  const authors = Array.from(new Set(books.map(b => b.author).filter(Boolean))).sort()
  const categories = Array.from(new Set(books.map(b => b.category).filter(Boolean))).sort()
  const documentTypes = Array.from(new Set(books.map(b => b.DocumentType || '').filter(Boolean))).sort()

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 0'
    }}>
      <Head>
        <title>Thư viện Sách | Khám phá và Tìm kiếm</title>
      </Head>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
        {/* Header Section */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 48,
          padding: '40px 20px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: 24,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <BookOutlined style={{ fontSize: 64, color: '#fff', marginBottom: 16 }} />
          <Title level={1} style={{ color: '#fff', marginBottom: 8, fontSize: 48 }}>
            Thư viện Sách
          </Title>
          <Paragraph style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 18, margin: 0 }}>
            Khám phá và tìm kiếm hàng trăm đầu sách chất lượng cao
          </Paragraph>
        </div>

        {/* Filter Card */}
        <Card 
          style={{ 
            marginBottom: 32,
            borderRadius: 16,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            border: 'none',
            overflow: 'hidden'
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <Space align="center" style={{ marginBottom: 24 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FilterOutlined style={{ color: '#fff', fontSize: 20 }} />
            </div>
            <Title level={3} style={{ margin: 0 }}>Bộ lọc tìm kiếm</Title>
          </Space>

          <Row gutter={[16, 16]} align="bottom">
            <Col xs={24} sm={12} md={8} lg={6}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Tên sách</Text>
              <Input
                size="large"
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Tìm kiếm tên sách..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                allowClear
                style={{ borderRadius: 8 }}
              />
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Tác giả</Text>
              <Select
                size="large"
                value={filters.author || ''}
                onChange={(value) => setFilters(prev => ({ ...prev, author: value }))}
                style={{ width: '100%', borderRadius: 8 }}
                suffixIcon={<UserOutlined />}
              >
                <Option value="">Tất cả tác giả</Option>
                {authors.map(author => (
                  <Option key={author} value={author}>{author}</Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Thể loại</Text>
              <Select
                size="large"
                value={filters.category || ''}
                onChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                style={{ width: '100%', borderRadius: 8 }}
                suffixIcon={<AppstoreOutlined />}
              >
                <Option value="">Tất cả thể loại</Option>
                {categories.map(category => (
                  <Option key={category} value={category}>{category}</Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Loại tài liệu</Text>
              <Select
                size="large"
                value={filters.documentType || ''}
                onChange={(value) => setFilters(prev => ({ ...prev, documentType: value }))}
                style={{ width: '100%', borderRadius: 8 }}
              >
                <Option value="">Tất cả loại sách</Option>
                {documentTypes.map(dt => (
                  <Option key={dt} value={dt}>{dt}</Option>
                ))}
              </Select>
            </Col>
          </Row>

          <Divider />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <Badge 
              count={filteredBooks.length} 
              showZero 
              style={{ backgroundColor: '#52c41a' }}
              overflowCount={999}
            >
              <Text strong style={{ fontSize: 16, marginRight: 8 }}>
                Kết quả: {filteredBooks.length} / {books.length} sách
              </Text>
            </Badge>
            <Button 
              size="large"
              onClick={resetFilters} 
              icon={<RedoOutlined />}
              style={{ borderRadius: 8 }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </Card>

        {/* Books Grid */}
        {filteredBooks.length > 0 ? (
          <Row gutter={[24, 24]}>
            {filteredBooks.map((book) => (
              <Col xs={24} sm={12} md={8} lg={6} key={book.id}>
                <Card
                  hoverable
                  style={{
                    height: '100%',
                    borderRadius: 16,
                    overflow: 'hidden',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: '#fff'
                  }}
                  bodyStyle={{ padding: 16 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)'
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)'
                  }}
                  cover={
                    <Link href={`/books/details?books_id=${book.books_id ?? book.id}`}>
                      <div style={{ 
                        position: 'relative', 
                        height: 320,
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                      }}>
                        <Image
                          alt={book.Title || book.title || 'Book cover'}
                          src={resolveImageSrc(book)}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          style={{ objectFit: 'cover' }}
                          priority={false}
                        />
                        <div style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8
                        }}>
                          {book.category && (
                            <Tag 
                              color="blue" 
                              style={{ 
                                margin: 0, 
                                borderRadius: 6,
                                padding: '4px 12px',
                                fontWeight: 500,
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                              }}
                            >
                              {book.category}
                            </Tag>
                          )}
                          {book.DocumentType && (
                            <Tag 
                              color="green"
                              style={{ 
                                margin: 0, 
                                borderRadius: 6,
                                padding: '4px 12px',
                                fontWeight: 500,
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                              }}
                            >
                              {book.DocumentType}
                            </Tag>
                          )}
                        </div>
                      </div>
                    </Link>
                  }
                >
                  <div style={{ minHeight: 140 }}>
                    <Link 
                      href={`/books/details?books_id=${book.books_id ?? book.id}`} 
                      style={{ textDecoration: 'none' }}
                    >
                      <Title 
                        level={5} 
                        ellipsis={{ rows: 2, tooltip: book.Title || book.title }}
                        style={{ 
                          margin: '0 0 12px 0',
                          fontSize: 16,
                          fontWeight: 600,
                          lineHeight: 1.4,
                          color: '#262626',
                          minHeight: 44
                        }}
                      >
                        {book.Title || book.title}
                      </Title>
                    </Link>

                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <Text type="secondary" style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <UserOutlined style={{ fontSize: 12 }} />
                        {book.author || '—'}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <BookOutlined style={{ fontSize: 12 }} />
                        {book.publisher || '—'}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CalendarOutlined style={{ fontSize: 12 }} />
                        {book.publishYear || '—'}
                      </Text>
                    </Space>
                  </div>

                  <Divider style={{ margin: '16px 0' }} />

                  <Link href={`/books/details?books_id=${book.books_id ?? book.id}`}>
                    <Button 
                      type="primary" 
                      block 
                      size="large"
                      style={{ 
                        borderRadius: 8,
                        fontWeight: 500,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none'
                      }}
                    >
                      Xem chi tiết
                    </Button>
                  </Link>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Card 
            style={{ 
              borderRadius: 16, 
              textAlign: 'center',
              padding: '60px 20px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
            }}
          >
            <Empty 
              description={
                <Text style={{ fontSize: 16, color: '#8c8c8c' }}>
                  Không tìm thấy sách phù hợp với tiêu chí tìm kiếm.
                </Text>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        )}
      </div>
    </div>
  )
}

export default BooksPage