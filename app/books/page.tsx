'use client'

import React, { useState, useEffect } from 'react'
import { Book } from '../../lib/types'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Button } from '../components/ui/Button'
import { Search, Filter, RefreshCw } from 'lucide-react'
import { show_books } from "@/app/sever/route";
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '../components/ui/Card'
import { add_book_review } from '@/app/sever/route'
import Head from 'next/head'
import { useAuth } from '@/lib/hooks/useAuth'
import { Modal, Rate, Form, Input as AntInput } from 'antd';


interface FilterOptions {
    author: string
    documentType: string
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
    const [reviewContent, setReviewContent] = useState('')
    const [rating, setRating] = useState(5)
    const [filters, setFilters] = useState<FilterOptions>({
        author: '',
        documentType: '',
        search: ''
    })

    const resolveImageSrc = (book: Book): string => {
        const raw = (book.coverUrl as string) || (book.image as string) || '/logo/logo.svg'
        if (!raw || typeof raw !== 'string') return '/logo/logo.svg'
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
        if (raw.startsWith('data:')) return raw
        if (raw.startsWith('/')) return raw
        // treat as relative path from public root
        return `/${raw.replace(/^\/+/, '')}`
    }

    // Lấy danh sách sách từ API
    const fetchBooks = async () => {
        try {
            setLoading(true)
            setError(null)
            
            const response = await show_books()
            
            if (response.success) {
                // Backend trả về trường legacy: Title, Publisher, DocumentType, image, books_id
                const list: Book[] = (response.data || []).map((b: any) => ({
                    // map tối thiểu để hiển thị, giữ nguyên các trường legacy cho UI dùng
                    id: String(b.books_id ?? b.id ?? crypto.randomUUID()),
                    title: b.Title ?? '',
                    author: b.Author ?? '',
                    publisher: b.Publisher ?? '',
                    publishYear: b.PublishYear ?? 0,
                    isbn: b.ISBN ?? '',
                    category: b.Category ?? '',
                    description: b.Description ?? '',
                    coverUrl: b.image ?? '/logo/logo.svg',
                    totalCopies: b.totalCopies ?? 0,
                    availableCopies: b.availableCopies ?? 0,
                    rating: b.rating ?? 0,
                    reviews: b.reviews ?? 0,
                    tags: b.tags ?? [],
                    // keep legacy
                    books_id: b.books_id,
                    Title: b.Title,
                    Publisher: b.Publisher,
                    DocumentType: b.DocumentType,
                    Description: b.Description,
                    ISBN: b.ISBN,
                    PublishYear: b.PublishYear,
                    Language: b.Language,
                    UploadDate: b.UploadDate,
                    UploadedBy: b.UploadedBy,
                    image: b.image,
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

    // Lọc sách theo các tiêu chí
    const filterBooks = () => {
        let filtered = [...books]

        // Lọc theo tác giả
        if (filters.author) {
            filtered = filtered.filter(book => 
                (book.author || '').toLowerCase().includes(filters.author.toLowerCase())
            )
        }

        // Lọc theo loại tài liệu
        if (filters.documentType) {
            filtered = filtered.filter(book => 
                (book.DocumentType || '').toLowerCase().includes(filters.documentType.toLowerCase())
            )
        }

        // Tìm kiếm theo tên sách
        if (filters.search) {
            filtered = filtered.filter(book => 
                (book.title || '').toLowerCase().includes(filters.search.toLowerCase()) ||
                (book.Title || '').toLowerCase().includes(filters.search.toLowerCase())
            )
        }

        setFilteredBooks(filtered)
    }

    // Lấy danh sách unique values cho filter options
    const getUniqueValues = (key: keyof Book) => {
        return Array.from(new Set(
            books.map(book => book[key])
                .filter(Boolean)
                .filter((value): value is string => typeof value === 'string')
        ))
    }

    // Reset filters
    const resetFilters = () => {
        setFilters({
            author: '',
            documentType: '',
            search: ''
        })
        setFilteredBooks(books)
    }

    useEffect(() => {
        fetchBooks()
    }, [])

    useEffect(() => {
        filterBooks()
    }, [filters, books])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="flex items-center space-x-2">
                            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                            <span className="text-lg">Đang tải danh sách sách...</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
                                Lỗi tải dữ liệu
                            </h2>
                            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
                            <Button onClick={fetchBooks} className="bg-red-600 hover:bg-red-700">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Thử lại
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Head>
                <title>Thư viện sách | Khám phá và tìm kiếm</title>
                <meta name="description" content="Khám phá thư viện sách: tìm kiếm theo tác giả, thể loại, nhà xuất bản. Xem chi tiết từng cuốn sách, đánh giá và thông tin xuất bản." />
                <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : undefined} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Thư viện sách" />
                <meta property="og:description" content="Tìm kiếm và khám phá hàng trăm đầu sách theo nhiều tiêu chí khác nhau." />
                <meta property="og:image" content="/logo/logo.svg" />
                <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : undefined} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Thư viện sách" />
                <meta name="twitter:description" content="Khám phá kho sách đa dạng, xem chi tiết và đánh giá." />
                <meta name="twitter:image" content="/logo/logo.svg" />
                <script
                    type="application/ld+json"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'CollectionPage',
                            name: 'Thư viện sách',
                            description: 'Trang danh sách sách với bộ lọc và tìm kiếm.',
                        }),
                    }}
                />
            </Head>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Thư viện sách
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Khám phá và tìm kiếm sách theo tác giả, thể loại, nhà xuất bản
                    </p>
                </div>

                {/* Filter Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
                    <div className="flex items-center mb-4">
                        <Filter className="w-5 h-5 text-primary mr-2" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Bộ lọc tìm kiếm
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* Search Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tìm kiếm
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Tên sách..."
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Author Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tác giả
                            </label>
                            <Select
                                value={filters.author}
                                onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value }))}
                            >
                                <option value="">Tất cả tác giả</option>
                                {getUniqueValues('author').map(author => (
                                    <option key={author} value={author}>
                                        {author}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        {/* DocumentType Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Loại tài liệu
                            </label>
                            <Select
                                value={filters.documentType}
                                onChange={(e) => setFilters(prev => ({ ...prev, documentType: e.target.value }))}
                            >
                                <option value="">Tất cả loại</option>
                                {Array.from(new Set(books.map(b => (b.DocumentType || '')).filter(Boolean))).map(dt => (
                                    <option key={dt} value={dt}>{dt}</option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Hiển thị {filteredBooks.length} / {books.length} sách
                        </div>
                        <Button
                            variant="outline"
                            onClick={resetFilters}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            Xóa bộ lọc
                        </Button>
                    </div>
                </div>

                {/* Books Grid */}
                {filteredBooks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredBooks.map((book) => (
                            <Card key={book.id} className="overflow-hidden">
                                <div className="relative w-full bg-gray-100 dark:bg-gray-700 rounded-b-none pb-[133%]">
                                    <Image
                                        src={resolveImageSrc(book)}
                                        alt={book.Title || book.title || 'Book cover'}
                                        fill
                                        className="object-cover"
                                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                                        unoptimized
                                    />
                                </div>
                                <CardContent className="p-4 space-y-2">
                                    <Link href={`/books/details?books_id=${book.books_id ?? book.id}`} className="block font-semibold text-gray-900 dark:text-white line-clamp-2">
                                        {book.Title || book.title}
                                    </Link>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                        <p><span className="font-medium">Tác giả:</span> {book.Author || book.author || '—'}</p>
                                        <p><span className="font-medium">Kiểu tài liệu:</span> {book.DocumentType || '—'}</p>
                                    </div>
                                    <div className="pt-2 space-x-2">
                                        <Button onClick={() => {
                                            try {
                                                const raw = localStorage.getItem('favoriteBooks')
                                                const set = new Set<number>(raw ? JSON.parse(raw) : [])
                                                const idNum = Number(book.books_id ?? book.id)
                                                if (set.has(idNum)) set.delete(idNum); else set.add(idNum)
                                                localStorage.setItem('favoriteBooks', JSON.stringify(Array.from(set)))
                                            } catch {}
                                        }}>
                                            Thêm yêu thích
                                        </Button>
                                        <Button 
                                            onClick={() => {
                                                if (!user) {
                                                    Modal.warning({
                                                        title: 'Yêu cầu đăng nhập',
                                                        content: 'Vui lòng đăng nhập để đánh giá sách',
                                                    });
                                                    return;
                                                }
                                                setSelectedBook(book);
                                                setReviewModalVisible(true);
                                            }}
                                            variant="secondary"
                                        >
                                            Đánh giá
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Không tìm thấy sách
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Không có sách nào phù hợp với tiêu chí tìm kiếm của bạn
                            </p>
                            <Button onClick={resetFilters} variant="outline">
                                Xóa bộ lọc
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <Modal
                title="Đánh giá sách"
                open={reviewModalVisible}
                onCancel={() => {
                    setReviewModalVisible(false)
                    form.resetFields()
                }}
                footer={null}
            >
                <Form
                    form={form}
                    onFinish={async (values) => {
                        if (!selectedBook || !user) return;
                        setSubmitting(true)
                        try {
                            const response = await add_book_review({
                                books_id: Number(selectedBook.books_id ?? selectedBook.id),
                                user_id: user.id,
                                rating: values.rating,
                                comment: values.comment
                            });
                            
                            if (response.success) {
                                Modal.success({
                                    title: 'Thành công',
                                    content: 'Cảm ơn bạn đã đánh giá sách!'
                                });
                                setReviewModalVisible(false)
                                form.resetFields()
                            } else {
                                Modal.error({
                                    title: 'Lỗi',
                                    content: response.message || 'Có lỗi xảy ra khi gửi đánh giá'
                                });
                            }
                        } catch (error) {
                            Modal.error({
                                title: 'Lỗi',
                                content: 'Có lỗi xảy ra khi gửi đánh giá'
                            });
                        } finally {
                            setSubmitting(false)
                        }
                    }}
                >
                    <Form.Item
                        name="rating"
                        label="Đánh giá"
                        rules={[{ required: true, message: 'Vui lòng chọn số sao đánh giá!' }]}
                    >
                        <Rate />
                    </Form.Item>
                    <Form.Item
                        name="comment"
                        label="Nhận xét"
                        rules={[{ required: true, message: 'Vui lòng nhập nhận xét!' }]}
                    >
                        <AntInput.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default BooksPage
