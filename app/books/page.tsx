'use client'

import React, { useState, useEffect } from 'react'
import { Book } from '../../lib/types'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Button } from '../components/ui/Button'
import { Search, Filter, RefreshCw } from 'lucide-react'
import { show_books, show_book_search } from "@/app/sever/route"
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '../components/ui/Card'
import { add_book_review } from '@/app/sever/route'
import Head from 'next/head'
import { useAuth } from '@/lib/hooks/useAuth'
import { Modal, Rate, Form, Input as AntInput } from 'antd'
import { useSearchParams } from 'next/navigation'

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
    const raw = (book.coverUrl as string) || (book.image as string) || '/logo/logo.svg'
    if (!raw || typeof raw !== 'string') return '/logo/logo.svg'
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
    if (raw.startsWith('data:')) return raw
    if (raw.startsWith('/')) return raw
    return `/${raw.replace(/^\/+/, '')}`
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
          books_id: b.books_id
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
    
    // Tìm kiếm theo tên sách
    if (filters.search) {
      filtered = filtered.filter(book =>
        (book.title || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (book.Title || '').toLowerCase().includes(filters.search.toLowerCase())
      )
    }
    
    // Lọc theo tác giả
    if (filters.author) {
      filtered = filtered.filter(book =>
        (book.author || '').toLowerCase() === filters.author.toLowerCase()
      )
    }
    
    // Lọc theo thể loại (category)
    if (filters.category) {
      filtered = filtered.filter(book =>
        (book.category || '').toLowerCase() === filters.category.toLowerCase()
      )
    }
    
    // Lọc theo loại tài liệu (DocumentType)
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
          // ✅ Gọi API show_book_search()
          const res = await show_book_search(searchQuery)
          if (res.success && Array.isArray(res.books)) {
            // ✅ Chuẩn hóa dữ liệu giống format show_books()
            const list: Book[] = res.books.map((b: any) => ({
              id: String(b.books_id ?? crypto.randomUUID()),
              title: b.Title ?? '',
              author: b.Author ?? '',
              category: b.Category ?? '',
              coverUrl: b.image ?? '/logo/logo.svg',
              DocumentType: b.DocumentType ?? '',
              books_id: b.books_id
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
  // ⏳ Loading UI
  // ==============================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          <span className="text-lg text-gray-700 dark:text-gray-300">Đang tải danh sách sách...</span>
        </div>
      </div>
    )
  }

  // ==============================
  // ❌ Error UI
  // ==============================
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 border border-red-400 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <Button onClick={fetchBooks} className="bg-red-600 hover:bg-red-700 text-white">
            <RefreshCw className="w-4 h-4 mr-2" /> Thử lại
          </Button>
        </div>
      </div>
    )
  }

  // ==============================
  // 🖼️ Giao diện chính
  // ==============================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>Thư viện Sách | Khám phá và Tìm kiếm</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Thư viện Sách</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Khám phá và tìm kiếm hàng trăm đầu sách.</p>

        {/* Bộ lọc */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 text-primary mr-2" />
            <h2 className="text-lg font-semibold">Bộ lọc tìm kiếm</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Ô tìm kiếm tên sách */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm tên sách..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-9"
              />
            </div>

            {/* Bộ lọc tác giả */}
            <Select
              value={filters.author}
              onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value }))}
            >
              <option value="">Tất cả tác giả</option>
              {Array.from(new Set(books.map(b => b.author).filter(Boolean))).sort().map(author => (
                <option key={author} value={author}>{author}</option>
              ))}
            </Select>

            {/* Bộ lọc thể loại (category) */}
            <Select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">Tất cả thể loại</option>
              {Array.from(new Set(books.map(b => b.category).filter(Boolean))).sort().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Select>

            {/* Bộ lọc loại tài liệu (DocumentType) */}
            <Select
              value={filters.documentType}
              onChange={(e) => setFilters(prev => ({ ...prev, documentType: e.target.value }))}
            >
              <option value="">Tất cả loại sách</option>
              {Array.from(new Set(books.map(b => b.DocumentType || '').filter(Boolean))).sort().map(dt => (
                <option key={dt} value={dt}>{dt}</option>
              ))}
            </Select>

            <Button onClick={resetFilters} variant="outline">
              Xóa bộ lọc
            </Button>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            Hiển thị {filteredBooks.length} / {books.length} sách
          </div>
        </div>

        {/* Danh sách sách */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative bg-gray-100 dark:bg-gray-700 pb-[133%]">
                  <Image
                    src={resolveImageSrc(book)}
                    alt={book.Title || book.title || 'Book cover'}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <Link
                    href={`/books/details?books_id=${book.books_id ?? book.id}`}
                    className="block font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition line-clamp-2"
                  >
                    {book.Title || book.title}
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Tác giả: {book.author || '—'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Loại: {book.DocumentType || '—'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600 dark:text-gray-300">
            Không tìm thấy sách phù hợp với tiêu chí tìm kiếm.
          </div>
        )}
      </div>
    </div>
  )
}

export default BooksPage
