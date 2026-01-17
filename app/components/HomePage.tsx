'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from './ui/Button'
import { MOCK_BOOKS } from '../../lib/constants'
import BookCard from './BookCard'
import { show_books } from '@/app/actions/generalActions'
import { Book } from '../../lib/types'

// Hàm xử lý đường dẫn ảnh để đảm bảo format đúng cho next/image
const resolveImageSrc = (imagePath: string | null | undefined): string => {
    if (!imagePath || typeof imagePath !== 'string') return '/logo/logo.svg'
    // Nếu là URL tuyệt đối hoặc data URL, giữ nguyên
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath
    if (imagePath.startsWith('data:')) return imagePath
    // Nếu đã có dấu "/" ở đầu, giữ nguyên
    if (imagePath.startsWith('/')) return imagePath
    // Nếu không có dấu "/", thêm vào đầu
    return `/${imagePath.replace(/^\/+/, '')}`
}

export default function HomePage() {
    const [featuredBooks, setFeaturedBooks] = useState<Book[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchFeaturedBooks = async () => {
            try {
                setLoading(true)
                const response = await show_books()

                if (response.success && response.data) {
                    const now = new Date()

                    // Lọc sách có UploadDate trong vòng 7 ngày
                    const recentBooks = (response.data || [])
                        .filter((b: any) => {
                            if (!b.UploadDate) return false
                            const uploadDate = new Date(b.UploadDate)
                            const daysDiff = (now.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24)
                            return daysDiff <= 7 && daysDiff >= 0
                        })
                        .slice(0, 4) // Lấy tối đa 4 cuốn
                        .map((b: any) => ({
                            id: String(b.books_id ?? b.id ?? crypto.randomUUID()),
                            title: b.Title ?? '',
                            author: b.Author ?? '',
                            publisher: b.Publisher ?? '',
                            publishYear: b.PublishYear ?? 0,
                            isbn: b.ISBN ?? '',
                            category: b.Category ?? '',
                            description: b.Description ?? '',
                            coverUrl: resolveImageSrc(b.image),
                            totalCopies: b.total_copies ?? 0,
                            availableCopies: b.total_copies ?? 0,
                            rating: 0,
                            reviews: 0,
                            tags: [],
                            // Additional fields from API
                            Category: b.Category ?? '',
                            status: b.status ?? '',
                            total_copies: b.total_copies ?? 0,
                            view_count: b.view_count ?? 0,
                            // Legacy fields
                            books_id: b.books_id ?? 0,
                            Title: b.Title,
                            Author: b.Author,
                            Publisher: b.Publisher,
                            DocumentType: b.DocumentType,
                            Description: b.Description,
                            ISBN: b.ISBN,
                            PublishYear: b.PublishYear,
                            Language: b.Language,
                            IsPublic: b.IsPublic,
                            UploadDate: b.UploadDate,
                            UploadedBy: b.UploadedBy,
                            image: b.image
                        }))

                    setFeaturedBooks(recentBooks)
                } else {
                    setFeaturedBooks([])
                }
            } catch (error) {
                console.error('Error fetching featured books:', error)
                setFeaturedBooks([])
            } finally {
                setLoading(false)
            }
        }

        fetchFeaturedBooks()
    }, [])

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                                Thư Viện Số
                                <br />
                                <span className="text-yellow-300">Đại Học Vinh</span>
                            </h1>

                            <p className="text-xl lg:text-2xl opacity-90">
                                Khám phá kho tàng tri thức số với hơn 100,000 đầu sách.
                                Mượn sách online 24/7, tìm kiếm thông minh, đặt phòng học nhóm.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900">
                                    Khám Phá Ngay
                                </Button>
                                <Button size="lg" className="bg-black hover:bg-gray-800 text-white border border-black hover:border-gray-800">
                                    Hướng Dẫn Sử Dụng
                                </Button>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-2xl">
                                <Image
                                    src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                                    alt="Thư viện hiện đại với công nghệ số"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-card">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div className="space-y-2">
                            <div className="text-3xl lg:text-4xl font-bold text-blue-600">100K+</div>
                            <div className="text-muted-foreground">Đầu Sách</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-3xl lg:text-4xl font-bold text-green-600">30K+</div>
                            <div className="text-muted-foreground">Người Dùng</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-3xl lg:text-4xl font-bold text-purple-600">24/7</div>
                            <div className="text-muted-foreground">Phục Vụ</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-3xl lg:text-4xl font-bold text-orange-600">15+</div>
                            <div className="text-muted-foreground">Khoa</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Books Section */}
            {featuredBooks.length > 0 && (
                <section className="py-16 bg-muted/50">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Sách Mới Tuần Này</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Khám phá những đầu sách được yêu thích nhất từ các lĩnh vực khoa học,
                                công nghệ, kinh tế và nhân văn
                            </p>
                        </div>
                        {loading ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">Đang tải sách...</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                                    {featuredBooks.map((book) => (
                                        <BookCard key={book.id} book={book} />
                                    ))}
                                </div>
                                <div className="text-center">
                                    <Link href="/books">
                                        <Button size="lg">Xem Tất Cả Sách</Button>
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            )}

            {/* Services Section */}
            <section className="py-16 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">Dịch Vụ Thư Viện</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Trải nghiệm các dịch vụ hiện đại và tiện lợi được thiết kế đặc biệt
                            cho sinh viên và giảng viên
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="text-center p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Mượn Sách Online</h3>
                            <p className="text-muted-foreground">
                                Mượn và gia hạn sách trực tuyến 24/7 với quy trình đơn giản, nhanh chóng
                            </p>
                        </div>
                        <div className="text-center p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Tìm Kiếm Thông Minh</h3>
                            <p className="text-muted-foreground">
                                Công cụ tìm kiếm AI hỗ trợ tìm chính xác tài liệu theo nhu cầu học tập
                            </p>
                        </div>
                        <div className="text-center p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Phòng Học Nhóm</h3>
                            <p className="text-muted-foreground">
                                Đặt phòng học nhóm, phòng thảo luận với đầy đủ tiện nghi hiện đại
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="py-16 bg-primary text-primary-foreground">
                <div className="container mx-auto max-w-4xl px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Nhận Thông Báo Sách Mới</h2>
                    <p className="text-lg mb-8 opacity-90">
                        Đăng ký nhận thông báo về sách mới, tài liệu cập nhật và sự kiện thư viện
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Email sinh viên/giảng viên..."
                            className="flex-1 px-4 py-2 rounded-md bg-background text-foreground border"
                        />
                        <Button variant="secondary">Đăng Ký Nhận Tin</Button>
                    </div>
                </div>
            </section>

            {/* SEO Content Section */}
            <section className="py-16 bg-muted/50">
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Thư Viện Số Đại Học Vinh - Dẫn Đầu Về Công Nghệ</h2>
                            <p className="text-lg mb-4">
                                <strong>Thư viện số Đại học Vinh</strong> là hệ thống quản lý tri thức hiện đại nhất khu vực Bắc Trung Bộ,
                                phục vụ hơn 30,000 sinh viên, giảng viên và cán bộ nghiên cứu.
                            </p>
                            <p className="mb-4">
                                Với <strong>hơn 100,000 đầu sách</strong> thuộc mọi lĩnh vực từ khoa học tự nhiên đến khoa học xã hội nhân văn,
                                chúng tôi tự hào là <strong>kho tàng tri thức số 1 tại Nghệ An</strong>.
                            </p>
                            <ul className="space-y-2 text-sm">
                                <li>✓ Mượn sách online 24/7, không giới hạn thời gian</li>
                                <li>✓ Tìm kiếm thông minh với AI hỗ trợ</li>
                                <li>✓ Truy cập cơ sở dữ liệu quốc tế (IEEE, SpringerLink, JSTOR)</li>
                                <li>✓ Đặt chỗ phòng học nhóm trực tuyến</li>
                                <li>✓ Hỗ trợ nghiên cứu chuyên sâu</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold mb-4">Các Lĩnh Vực Chuyên Môn</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <h4 className="font-semibold mb-2">Khoa Học Tự Nhiên:</h4>
                                    <ul className="space-y-1">
                                        <li>• Toán học & Thống kê</li>
                                        <li>• Vật lý & Thiên văn</li>
                                        <li>• Hóa học & Môi trường</li>
                                        <li>• Sinh học & Y học</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Công Nghệ & Kỹ Thuật:</h4>
                                    <ul className="space-y-1">
                                        <li>• Khoa học máy tính</li>
                                        <li>• Công nghệ thông tin</li>
                                        <li>• Kỹ thuật & Công nghệ</li>
                                        <li>• Trí tuệ nhân tạo</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Khoa Học Xã Hội:</h4>
                                    <ul className="space-y-1">
                                        <li>• Kinh tế & Quản lý</li>
                                        <li>• Luật & Chính trị</li>
                                        <li>• Giáo dục & Tâm lý</li>
                                        <li>• Xã hội học</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Nhân Văn & Nghệ Thuật:</h4>
                                    <ul className="space-y-1">
                                        <li>• Văn học & Ngôn ngữ</li>
                                        <li>• Lịch sử & Địa lý</li>
                                        <li>• Triết học & Tôn giáo</li>
                                        <li>• Nghệ thuật & Văn hóa</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional SEO Keywords Section */}
                    <div className="mt-16 text-center">
                        <h3 className="text-2xl font-semibold mb-6">Tại Sao Chọn Thư Viện Số Đại Học Vinh?</h3>
                        <div className="grid md:grid-cols-3 gap-6 text-left">
                            <div className="bg-card p-6 rounded-lg shadow-sm">
                                <h4 className="font-semibold text-lg mb-3 text-blue-600">Công Nghệ Tiên Tiến</h4>
                                <p className="text-sm text-muted-foreground">
                                    Hệ thống quản lý thư viện hiện đại nhất miền Bắc, tích hợp AI và machine learning
                                    để tối ưu trải nghiệm người dùng. Tương thích mọi thiết bị từ máy tính đến điện thoại.
                                </p>
                            </div>
                            <div className="bg-card p-6 rounded-lg shadow-sm">
                                <h4 className="font-semibold text-lg mb-3 text-green-600">Đa Dạng Tài Liệu</h4>
                                <p className="text-sm text-muted-foreground">
                                    Từ sách giáo khoa chuyên ngành đến tài liệu nghiên cứu quốc tế,
                                    luận văn thạc sĩ và luận án tiến sĩ. Cập nhật liên tục theo xu hướng giáo dục.
                                </p>
                            </div>
                            <div className="bg-card p-6 rounded-lg shadow-sm">
                                <h4 className="font-semibold text-lg mb-3 text-purple-600">Hỗ Trợ Chuyên Nghiệp</h4>
                                <p className="text-sm text-muted-foreground">
                                    Đội ngũ thủ thư và chuyên gia thông tin với trình độ cao,
                                    sẵn sàng hỗ trợ nghiên cứu và học tập 24/7 qua nhiều kênh.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}