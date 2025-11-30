'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { useBorrow } from '../../lib/hooks/useBorrow'
import { Star, BookOpen, Heart, Eye } from 'lucide-react'
import { useFavorites } from '../../lib/hooks/useFavorites'

// 1. Định nghĩa Interface khớp chính xác với JSON trả về
export interface Book {
    books_id: number;
    Title: string;
    Author: string;
    Category: string;
    Description?: string;
    ISBN: string;
    image: string;       // JSON trả về: "books/..."
    file?: string;
    status: string;      // JSON trả về: "Còn"
    total_copies: number;
    view_count: number;
    rating?: number;     // JSON chưa có, sẽ dùng default
    [key: string]: any;  // Cho phép các trường mở rộng khác
}

interface BookCardProps {
    book: Book
}

// 2. Hàm xử lý ảnh dựa trên dữ liệu JSON (VD: "books/abc.jpg")
const resolveImageSrc = (imagePath: string): string => {
    if (!imagePath) return '/logo/logo.svg'
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath
    if (imagePath === '/logo/logo.svg') return imagePath
    
    // Xử lý đường dẫn tương đối từ API
    // VD: books/abc.jpg -> /api/get_file?file=books%2Fabc.jpg
    if (!imagePath.includes('/api/get_file')) {
        // Loại bỏ dấu / ở đầu nếu có để tránh double slash khi nối
        const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
        return `/api/get_file?file=${encodeURIComponent(cleanPath)}`
    }
    return imagePath
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
    const { borrowBook } = useBorrow()
    const { isFavorite, toggleFavorite } = useFavorites()
    // Lấy dữ liệu trực tiếp từ props, không cần cast "any"
    const targetId = book.books_id
    const detailsHref = `/books/details?books_id=${encodeURIComponent(String(targetId))}`

    // Logic trạng thái
    const totalCopies = book.total_copies ?? 0;
    const isAvailable = book.totalCopies ?? 0;
    
    // Ưu tiên hiển thị text từ API, nếu không thì tự tính
    const statusText = book.status || (isAvailable ? 'Còn sách' : 'Hết sách');

    const statusColorClass = statusText.toLowerCase().includes('còn')
        ? "bg-green-50 text-green-600 border-green-200"
        : "bg-red-50 text-red-600 border-red-200";

    return (
        <Card className="group flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-gray-200 overflow-hidden bg-white dark:bg-gray-900">
            <CardHeader className="p-0">
                <Link href={detailsHref} className="block relative">
                    <div className="relative w-full h-80 overflow-hidden">
                        <Image
                          alt={book.Title || 'Book cover'}
                          src={resolveImageSrc(book.image)}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          priority={false}
                          unoptimized={true}
                        />
                        
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        
                        {/* Nút yêu thích */}
                        <button
                            aria-label="toggle-favorite"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(targetId) }}
                            className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-2 shadow-sm transition-all hover:scale-110 z-10"
                        >
                            <Heart className={`w-4 h-4 ${isFavorite(targetId) ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                        </button>

                        {/* Badge Category */}
                        <span className="absolute top-2 left-2 bg-blue-600/90 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded shadow-sm">
                            {book.Category || 'General'}
                        </span>
                    </div>
                </Link>
            </CardHeader>

            <CardContent className="p-4 flex-grow flex flex-col gap-2">
                <CardTitle className="text-lg font-bold leading-tight line-clamp-2 min-h-[3rem] group-hover:text-blue-600 transition-colors">
                    <Link href={detailsHref}>
                        {book.Title}
                    </Link>
                </CardTitle>
                
                <div className="text-sm text-gray-500 line-clamp-1 font-medium">
                    {book.Author}
                </div>

                {/* Khu vực đánh giá và view */}
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md text-yellow-700">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{book.rating || 4.5}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{book.view_count ?? 0} lượt xem</span>
                    </div>
                </div>

                {/* Footer con: Trạng thái + Số lượng */}
                <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-100">
                     <div className={`px-2.5 py-1 rounded-md border text-xs font-semibold flex items-center gap-1.5 ${statusColorClass}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        {statusText}
                     </div>
                     <span className="text-sm font-medium text-gray-600">
                        SL: <span className="text-blue-600 font-bold">{totalCopies}</span>
                     </span>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex justify-center items-center">
                <div className="text-xs text-gray-400 font-mono truncate" title={book.ISBN}>
                    {book.ISBN}
                </div>
            </CardFooter>
        </Card>
    )
}

export default BookCard