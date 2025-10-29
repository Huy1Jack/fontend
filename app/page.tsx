import { Suspense } from 'react'
import HomePage from './components/HomePage'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Trang Chủ - Mượn Sách Online 24/7',
    description: 'Thư viện số Đại học Vinh - Mượn sách online, tìm kiếm tài liệu học thuật, truy cập cơ sở dữ liệu khoa học. Hơn 100,000 đầu sách phục vụ sinh viên, giảng viên 24/7.',
    keywords: [
        'mượn sách online đại học vinh',
        'thư viện số nghệ an',
        'tài liệu học thuật miễn phí',
        'cơ sở dữ liệu khoa học',
        'sách giáo khoa đại học',
        'e-book việt nam',
        'thư viện điện tử'
    ],
    openGraph: {
        title: 'Thư viện Số Đại học Vinh - Mượn Sách Online Miễn Phí',
        description: 'Hệ thống thư viện số với hơn 100,000 đầu sách. Mượn sách online 24/7, tìm kiếm tài liệu nhanh chóng, phục vụ tận tâm.',
    }
}

export default function Page() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
            <HomePage />
        </Suspense>
    )
}