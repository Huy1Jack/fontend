'use client'

import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Spin, Alert, Empty } from 'antd'
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from 'recharts'
import { 
    BookOpen, 
    Users, 
    Calendar, 
    Star, 
    BarChart3,
    TrendingUp,
    RefreshCw,
    Library,
    UserCheck
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import Image from 'next/image'
import { get_book_admin, get_user, get_borrow_return } from '@/app/sever/admin/route'
import { getAuthCookie } from "@/app/sever/authcookie/route";
import { useRouter } from 'next/navigation';
import { message } from 'antd';
interface StatisticsData {
    top_books: Array<{
        books_id: number
        book_title: string
        image?: string
        borrow_count: number
    }>
    top_readers: Array<{
        user_id: number
        user_name: string
        email?: string
        borrow_count: number
    }>
    monthly_borrow: Array<{
        month: string
        total_borrow: number
        total_return: number
    }>
    top_rated_books: Array<{
        books_id: number
        book_title: string
        image?: string
        avg_rating: number
        total_reviews: number
    }>
    category_ratio: Array<{
        category_name: string
        total_borrowed: number
        percent_borrowed: number
    }>
    total_books?: number
    total_users?: number
    active_borrowers?: number
}

const resolveImageSrc = (imagePath: string | null | undefined): string => {
    if (!imagePath || typeof imagePath !== 'string') return '/logo/logo.svg'
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath
    if (imagePath.startsWith('data:')) return imagePath
    if (imagePath.startsWith('/')) return imagePath
    return `/${imagePath.replace(/^\/+/, '')}`
}

export default function AdminPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [statistics, setStatistics] = useState<StatisticsData | null>(null)

    const fetchStatistics = async () => {
        try {
            setLoading(true)
            setError(null)
            
            // Gọi API get_statistics chính
            const statisticsResponse = await fetch('/api/get_statistics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const statisticsData = await statisticsResponse.json()
            
            // Khởi tạo giá trị mặc định
            let totalBooks = 0
            let totalUsers = 0
            let activeBorrowers = 0
            
            // Gọi các API để đếm (xử lý lỗi riêng biệt)
            try {
                const booksResponse = await get_book_admin()
                if (booksResponse.success && Array.isArray(booksResponse.data)) {
                    // Lọc sách có IsPublic = 1
                    totalBooks = booksResponse.data.filter((book: any) => 
                        book.IsPublic === 1 || book.IsPublic === '1'
                    ).length
                }
            } catch (err) {
                console.error('Error fetching books:', err)
                // Không set error, chỉ log
            }
            
            try {
                const usersResponse = await get_user()
                if (usersResponse.success && Array.isArray(usersResponse.data)) {
                    totalUsers = usersResponse.data.length
                }
            } catch (err) {
                console.error('Error fetching users:', err)
                // Không set error, chỉ log
            }
            
            try {
                const borrowResponse = await get_borrow_return()
                if (borrowResponse.success && Array.isArray(borrowResponse.data)) {
                    // Lọc những bản ghi có status = 'Đang mượn' và return_date là null
                    const activeBorrows = borrowResponse.data.filter((item: any) => 
                        item.status === 'Đang mượn' && (!item.return_date || item.return_date === null)
                    )
                    // Đếm số user_id khác nhau (ưu tiên user_id, nếu không có thì dùng user_name)
                    const uniqueUserIds = new Set(
                        activeBorrows
                            .map((item: any) => item.user_id || item.user_name)
                            .filter((id: any) => id !== null && id !== undefined)
                    )
                    activeBorrowers = uniqueUserIds.size
                }
            } catch (err) {
                console.error('Error fetching borrows:', err)
                // Không set error, chỉ log
            }
            
            if (statisticsData.success && statisticsData.data) {
                // Cập nhật thống kê với dữ liệu từ các API
                setStatistics({
                    ...statisticsData.data,
                    total_books: totalBooks,
                    total_users: totalUsers,
                    active_borrowers: activeBorrowers
                })
            } else {
                setError(statisticsData.message || 'Không thể tải dữ liệu thống kê')
            }
        } catch (err: any) {
            setError(err.message || 'Lỗi kết nối đến server')
            console.error('Error fetching statistics:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStatistics()
        checkUser()
    }, [])

    const checkUser = async () => {
        try {
          const token = await getAuthCookie();
          if (!token) {
            message.error("Bạn chưa đăng nhập");
            router.push("/");
            return;
          }
    
          const payload = JSON.parse(atob(token.split(".")[1]));
          if (![1, 2].includes(payload.role)) {
            message.error("Bạn không có quyền truy cập trang này");
            router.push("/");
          }
        } catch (error) {
          console.error("Error checking user:", error);
          message.error("Máy chủ không phản hồi");
          router.push("/");
        }
      };
    // Cấu hình cột cho bảng Top sách
    const topBooksColumns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Ảnh bìa',
            dataIndex: 'image',
            key: 'image',
            width: 80,
            render: (image: string, record: any) => (
                <div className="relative w-12 h-16">
                    <Image
                        src={resolveImageSrc(image)}
                        alt={record.book_title}
                        fill
                        className="object-cover rounded"
                    />
                </div>
            ),
        },
        {
            title: 'Tên sách',
            dataIndex: 'book_title',
            key: 'book_title',
            ellipsis: true,
        },
        {
            title: 'Số lượt mượn',
            dataIndex: 'borrow_count',
            key: 'borrow_count',
            width: 120,
            sorter: (a: any, b: any) => a.borrow_count - b.borrow_count,
            render: (count: number) => (
                <Tag color="blue">{count}</Tag>
            ),
        },
    ]

    // Cấu hình cột cho bảng Top bạn đọc
    const topReadersColumns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Tên người dùng',
            dataIndex: 'user_name',
            key: 'user_name',
            ellipsis: true,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            ellipsis: true,
        },
        {
            title: 'Số lượt mượn',
            dataIndex: 'borrow_count',
            key: 'borrow_count',
            width: 120,
            sorter: (a: any, b: any) => a.borrow_count - b.borrow_count,
            render: (count: number) => (
                <Tag color="green">{count}</Tag>
            ),
        },
    ]

    // Cấu hình cột cho bảng Sách được đánh giá cao
    const topRatedBooksColumns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Ảnh bìa',
            dataIndex: 'image',
            key: 'image',
            width: 80,
            render: (image: string, record: any) => (
                <div className="relative w-12 h-16">
                    <Image
                        src={resolveImageSrc(image)}
                        alt={record.book_title}
                        fill
                        className="object-cover rounded"
                    />
                </div>
            ),
        },
        {
            title: 'Tên sách',
            dataIndex: 'book_title',
            key: 'book_title',
            ellipsis: true,
        },
        {
            title: 'Điểm đánh giá',
            dataIndex: 'avg_rating',
            key: 'avg_rating',
            width: 120,
            sorter: (a: any, b: any) => {
                const ratingA = typeof a.avg_rating === 'number' ? a.avg_rating : parseFloat(a.avg_rating) || 0;
                const ratingB = typeof b.avg_rating === 'number' ? b.avg_rating : parseFloat(b.avg_rating) || 0;
                return ratingA - ratingB;
            },
            render: (rating: any) => {
                const ratingNum = typeof rating === 'number' ? rating : parseFloat(rating) || 0;
                return (
                    <Tag color="gold">
                        ⭐ {ratingNum.toFixed(1)}
                    </Tag>
                );
            },
        },
        {
            title: 'Số đánh giá',
            dataIndex: 'total_reviews',
            key: 'total_reviews',
            width: 100,
            sorter: (a: any, b: any) => a.total_reviews - b.total_reviews,
        },
    ]

    // Cấu hình cột cho bảng Thể loại
    const categoryColumns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Thể loại',
            dataIndex: 'category_name',
            key: 'category_name',
            ellipsis: true,
        },
        {
            title: 'Số lượt mượn',
            dataIndex: 'total_borrowed',
            key: 'total_borrowed',
            width: 120,
            sorter: (a: any, b: any) => a.total_borrowed - b.total_borrowed,
        },
        {
            title: 'Tỷ lệ',
            dataIndex: 'percent_borrowed',
            key: 'percent_borrowed',
            width: 120,
            sorter: (a: any, b: any) => {
                const percentA = typeof a.percent_borrowed === 'number' ? a.percent_borrowed : parseFloat(a.percent_borrowed) || 0;
                const percentB = typeof b.percent_borrowed === 'number' ? b.percent_borrowed : parseFloat(b.percent_borrowed) || 0;
                return percentA - percentB;
            },
            render: (percent: any) => {
                const percentNum = typeof percent === 'number' ? percent : parseFloat(percent) || 0;
                return `${percentNum.toFixed(2)}%`;
            },
        },
    ]

    // Chuyển đổi dữ liệu cho biểu đồ
    const chartData = statistics?.monthly_borrow
        ? statistics.monthly_borrow.map((item) => ({
              month: item.month,
              'Mượn': item.total_borrow,
              'Trả': item.total_return,
          }))
        : []

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spin size="large" tip="Đang tải dữ liệu thống kê..." />
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-4">
                <Alert
                    message="Lỗi tải dữ liệu"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button onClick={fetchStatistics} size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Thử lại
                        </Button>
                    }
                />
            </div>
        )
    }

    if (!statistics) {
        return (
            <Empty
                description="Không có dữ liệu thống kê"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
        )
    }

    return (
        <div className="space-y-6">
            {/* Header với nút refresh */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Thống kê và Báo cáo</h2>
                    <p className="text-muted-foreground">
                        Tổng quan về hoạt động thư viện
                    </p>
                </div>
                <Button onClick={fetchStatistics}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Làm mới
                </Button>
            </div>

            {/* Thống kê tổng quan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tổng số sách */}
                <Card className="shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Tổng số sách</p>
                            <p className="text-3xl font-bold text-blue-600">
                                {statistics?.total_books?.toLocaleString('vi-VN') || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                            <Library className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                </Card>

                {/* Tổng số tài khoản */}
                <Card className="shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Tổng số tài khoản</p>
                            <p className="text-3xl font-bold text-green-600">
                                {statistics?.total_users?.toLocaleString('vi-VN') || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                            <Users className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                </Card>

                {/* Số người đang mượn sách */}
                <Card className="shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Đang mượn sách</p>
                            <p className="text-3xl font-bold text-orange-600">
                                {statistics?.active_borrowers?.toLocaleString('vi-VN') || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                            <UserCheck className="w-8 h-8 text-orange-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* 📘 Top 10 sách được mượn nhiều nhất */}
            <Card
                title={
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-500" />
                        <span>Top 10 Sách Được Mượn Nhiều Nhất</span>
                    </div>
                }
                className="shadow-sm"
            >
                <Table
                    columns={topBooksColumns}
                    dataSource={statistics.top_books}
                    rowKey="books_id"
                    pagination={false}
                    size="middle"
                />
            </Card>

            {/* 📅 Biểu đồ mượn theo tháng */}
            <Card
                title={
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-500" />
                        <span>Biểu Đồ Mượn Theo Tháng</span>
                    </div>
                }
                className="shadow-sm"
            >
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="month" 
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Mượn" fill="#1890ff" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Trả" fill="#52c41a" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <Empty
                        description="Chưa có dữ liệu mượn theo tháng"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                )}
            </Card>

            {/* ⭐ Sách được đánh giá cao nhất */}
            <Card
                title={
                    <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <span>Sách Được Đánh Giá Cao Nhất</span>
                    </div>
                }
                className="shadow-sm"
            >
                <Table
                    columns={topRatedBooksColumns}
                    dataSource={statistics.top_rated_books}
                    rowKey="books_id"
                    pagination={false}
                    size="middle"
                />
            </Card>

            {/* 🧾 Tỷ lệ thể loại được mượn nhiều nhất */}
            <Card
                title={
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-orange-500" />
                        <span>Tỷ Lệ Thể Loại Được Mượn Nhiều Nhất</span>
                    </div>
                }
                className="shadow-sm"
            >
                <Table
                    columns={categoryColumns}
                    dataSource={statistics.category_ratio}
                    rowKey="category_name"
                    pagination={false}
                    size="middle"
                />
            </Card>
        </div>
    )
}
