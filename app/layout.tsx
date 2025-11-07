import './globals.css'
import 'antd/dist/reset.css'
import type { Metadata, Viewport } from 'next'
import { Providers } from './providers'
import Layout from './components/Layout'
import { headers } from 'next/headers'

export const metadata: Metadata = {
    title: {
        default: 'Thư viện Số Đại học Vinh - Kho Tàng Tri Thức Số 1 Nghệ An',
        template: '%s | Thư viện Số Đại học Vinh'
    },
    description: 'Thư viện số Đại học Vinh - Hệ thống quản lý sách và tài liệu học thuật hàng đầu. Tìm kiếm, mượn sách online, truy cập cơ sở dữ liệu khoa học. Phục vụ 24/7 cho sinh viên, giảng viên Nghệ An.',
    keywords: [
        'thư viện số đại học vinh',
        'mượn sách online nghệ an',
        'tài liệu học thuật',
        'cơ sở dữ liệu khoa học',
        'đại học vinh',
        'thư viện điện tử',
        'sách giáo khoa',
        'nghiên cứu khoa học',
        'sinh viên nghệ an',
        'e-library vinh university'
    ],
    authors: [{ name: 'Thư viện Đại học Vinh' }],
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        type: 'website',
        locale: 'vi_VN',
        url: 'https://library.vinhuni.edu.vn',
        siteName: 'Thư viện Số Đại học Vinh',
        title: 'Thư viện Số Đại học Vinh - Kho Tàng Tri Thức Hàng Đầu Nghệ An',
        description: 'Hệ thống thư viện số hiện đại với hàng triệu tài liệu, sách giáo khoa, cơ sở dữ liệu khoa học. Mượn sách online 24/7.',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Thư viện Số Đại học Vinh',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Thư viện Số Đại học Vinh - Kho Tàng Tri Thức Số 1',
        description: 'Hệ thống thư viện số hiện đại phục vụ sinh viên, giảng viên Đại học Vinh. Mượn sách online, truy cập tài liệu khoa học.',
        images: ['/twitter-image.jpg'],
    },
    alternates: {
        canonical: 'https://library.vinhuni.edu.vn',
    },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Detect current path on the server to decide layout composition
    const headersList = headers()
    const pathname = headersList.get('x-invoke-path') || headersList.get('next-url') || ''
    const isAdmin = pathname.startsWith('/admin')
    return (
        <html lang="vi">
            <body suppressHydrationWarning className="font-sans">
                <Providers>
                    {isAdmin ? (
                        children
                    ) : (
                        <Layout>
                            {children}
                        </Layout>
                    )}
                </Providers>
            </body>
        </html>
    )
}