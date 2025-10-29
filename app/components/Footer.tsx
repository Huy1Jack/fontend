'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const Footer: React.FC = () => {
    return (
        <footer className="bg-muted text-muted-foreground">
            <div className="container max-w-7xl mx-auto py-8 px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center space-x-3 mb-3">
                            <Image
                                src="/logo/logo.svg"
                                alt="Logo Đại học Vinh"
                                width={48}
                                height={48}
                                className="h-12 w-12"
                            />
                            <h3 className="font-bold text-foreground">Thư viện Đại học Vinh</h3>
                        </div>
                        <p className="text-sm">Tri thức vô hạn, phục vụ tận tâm.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Dịch vụ</h4>
                        <ul className="space-y-1 text-sm">
                            <li><Link href="/books" className="hover:text-primary">Tìm kiếm sách</Link></li>
                            <li><Link href="/my-books" className="hover:text-primary">Sách đã mượn</Link></li>
                            <li><Link href="/study-rooms" className="hover:text-primary">Đặt phòng học</Link></li>
                            <li><Link href="/news" className="hover:text-primary">Tin tức</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Hỗ trợ</h4>
                        <ul className="space-y-1 text-sm">
                            <li><Link href="/about" className="hover:text-primary">Liên hệ</Link></li>
                            <li><Link href="/about" className="hover:text-primary">Hướng dẫn sử dụng</Link></li>
                            <li><Link href="/about" className="hover:text-primary">Quy định thư viện</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Pháp lý</h4>
                        <ul className="space-y-1 text-sm">
                            <li><a href="#" className="hover:text-primary">Điều khoản dịch vụ</a></li>
                            <li><a href="#" className="hover:text-primary">Chính sách bảo mật</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 pt-4 border-t border-border text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} Thư viện - Trường Đại học Vinh. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer