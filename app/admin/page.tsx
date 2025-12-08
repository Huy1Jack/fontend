'use client'

import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Spin, Alert, Empty, Statistic, Row, Col, Avatar } from 'antd'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts'
import {
    BookOpen,
    Users,
    Calendar,
    Star,
    BarChart3,
    RefreshCw,
    Library,
    UserCheck,
    Trophy,
    TrendingUp
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import Image from 'next/image'
import { get_book_admin, get_user, get_borrow_return } from '@/app/actions/adminActions'
import { getAuthCookie } from "@/app/actions/authActions";
import { useRouter } from 'next/navigation';
import { message } from 'antd';

// --- Interface Definitions ---
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

// --- Helper Functions ---
const resolveImageSrc = (imagePath: string | null | undefined): string => {
    if (!imagePath || typeof imagePath !== 'string') return '/logo/logo.svg'
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath
    if (imagePath.startsWith('data:')) return imagePath
    if (imagePath.startsWith('/')) return imagePath
    return `/api/get_file?file=${imagePath}`
}

export default function AdminPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [statistics, setStatistics] = useState<StatisticsData | null>(null)

    // --- Data Fetching ---
    const fetchStatistics = async () => {
        try {
            setLoading(true)
            setError(null)

            const statisticsResponse = await fetch('/api/get_statistics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
            const statisticsData = await statisticsResponse.json()

            let totalBooks = 0
            let totalUsers = 0
            let activeBorrowers = 0

            // Fetch Books count
            try {
                const booksResponse = await get_book_admin()
                if (booksResponse.success && Array.isArray(booksResponse.data)) {
                    totalBooks = booksResponse.data.filter((book: any) =>
                        book.IsPublic === 1 || book.IsPublic === '1'
                    ).length
                }
            } catch (err) { console.error('Error fetching books:', err) }

            // Fetch Users count
            try {
                const usersResponse = await get_user()
                if (usersResponse.success && Array.isArray(usersResponse.data)) {
                    totalUsers = usersResponse.data.length
                }
            } catch (err) { console.error('Error fetching users:', err) }

            // Fetch Active Borrowers
            try {
                const borrowResponse = await get_borrow_return()
                if (borrowResponse.success && Array.isArray(borrowResponse.data)) {
                    const activeBorrows = borrowResponse.data.filter((item: any) =>
                        item.status === 'Đang mượn' && (!item.return_date || item.return_date === null)
                    )
                    const uniqueUserIds = new Set(
                        activeBorrows
                            .map((item: any) => item.user_id || item.user_name)
                            .filter((id: any) => id !== null && id !== undefined)
                    )
                    activeBorrowers = uniqueUserIds.size
                }
            } catch (err) { console.error('Error fetching borrows:', err) }

            if (statisticsData.success && statisticsData.data) {
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

    // --- Table Configurations ---
    const sharedTableProps = {
        pagination: false,
        size: "middle" as const,
        className: "custom-table"
    };

    const topBooksColumns = [
        {
            title: '#',
            key: 'index',
            width: 50,
            render: (_: any, __: any, index: number) => <span className="text-gray-400 font-medium">{index + 1}</span>,
        },
        {
            title: 'Sách',
            dataIndex: 'book_title',
            key: 'book_title',
            render: (text: string, record: any) => (
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-14 flex-shrink-0 shadow-sm rounded-md overflow-hidden group">
                        <Image
                            src={resolveImageSrc(record.image)}
                            alt={text}
                            fill
                            sizes="40px"
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                    </div>
                    <span className="font-medium text-gray-700 line-clamp-2">{text}</span>
                </div>
            ),
        },
        {
            title: 'Lượt mượn',
            dataIndex: 'borrow_count',
            key: 'borrow_count',
            align: 'right' as const,
            width: 100,
            render: (count: number) => (
                <Tag color="geekblue" className="rounded-full px-3 border-0 bg-blue-50 text-blue-600 font-bold">
                    {count}
                </Tag>
            ),
        },
    ]

    const topReadersColumns = [
        {
            title: '#',
            key: 'index',
            width: 50,
            render: (_: any, __: any, index: number) => <span className="text-gray-400 font-medium">{index + 1}</span>,
        },
        {
            title: 'Bạn đọc',
            dataIndex: 'user_name',
            key: 'user_name',
            render: (text: string, record: any) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-700">{text}</span>
                    <span className="text-xs text-gray-400">{record.email}</span>
                </div>
            )
        },
        {
            title: 'Mượn',
            dataIndex: 'borrow_count',
            key: 'borrow_count',
            align: 'right' as const,
            width: 80,
            render: (count: number) => <span className="font-bold text-gray-700">{count}</span>,
        },
    ]

    const categoryColumns = [
        {
            title: 'Thể loại',
            dataIndex: 'category_name',
            key: 'category_name',
            render: (text: string) => <span className="font-medium text-gray-600">{text}</span>
        },
        {
            title: 'Tỷ lệ',
            dataIndex: 'percent_borrowed',
            key: 'percent_borrowed',
            align: 'right' as const,
            render: (percent: any) => {
                const p = typeof percent === 'number' ? percent : parseFloat(percent) || 0;
                return (
                    <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-indigo-400 to-cyan-400" 
                                style={{ width: `${Math.min(p, 100)}%` }} 
                            />
                        </div>
                        <span className="text-xs w-10 text-right">{p.toFixed(1)}%</span>
                    </div>
                );
            },
        },
    ]

    const chartData = statistics?.monthly_borrow
        ? statistics.monthly_borrow.map((item) => ({
            month: item.month,
            'Mượn': item.total_borrow,
            'Trả': item.total_return,
        }))
        : []

    // --- Render Logic ---
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Spin size="large" />
                <p className="mt-4 text-gray-500 animate-pulse">Đang tổng hợp dữ liệu...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6">
                <Alert
                    message="Không thể tải dữ liệu"
                    description={error}
                    type="error"
                    showIcon
                    action={<Button onClick={fetchStatistics}>Thử lại</Button>}
                />
            </div>
        )
    }

    if (!statistics) return <Empty description="Không có dữ liệu" className="mt-20" />

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">THỐNG KÊ VÀ BÁO CÁO</h1>
                    <p className="text-gray-500 mt-1">Tổng quan hoạt động và hiệu suất thư viện</p>
                </div>
                <Button 
                    onClick={fetchStatistics} 
                    className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-indigo-600 transition-all shadow-sm"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Cập nhật dữ liệu
                </Button>
            </div>

            {/* Overview Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard 
                    title="Tổng số đầu sách"
                    value={statistics?.total_books || 0}
                    icon={<Library className="w-6 h-6 text-white" />}
                    gradient="from-indigo-500 to-purple-500"
                    trend="+2 mới"
                />
                <StatsCard 
                    title="Bạn đọc đăng ký"
                    value={statistics?.total_users || 0}
                    icon={<Users className="w-6 h-6 text-white" />}
                    gradient="from-emerald-400 to-teal-500"
                    trend="Hoạt động"
                />
                <StatsCard 
                    title="Lượt mượn hiện tại"
                    value={statistics?.active_borrowers || 0}
                    icon={<BookOpen className="w-6 h-6 text-white" />}
                    gradient="from-orange-400 to-pink-500"
                    trend="Đang mượn"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Chart (Span 2) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Monthly Chart */}
                    <Card bordered={false} className="shadow-lg shadow-gray-200/50 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Thống kê Mượn/Trả</h3>
                            </div>
                            <Tag color="blue">Năm 2025</Tag>
                        </div>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorBorrow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorReturn" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend iconType="circle" />
                                    <Area type="monotone" dataKey="Mượn" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorBorrow)" />
                                    <Area type="monotone" dataKey="Trả" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorReturn)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Top Books Table */}
                    <Card bordered={false} className="shadow-lg shadow-gray-200/50 rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <Trophy className="w-5 h-5 text-amber-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Top Sách Thịnh Hành</h3>
                        </div>
                        <Table
                            columns={topBooksColumns}
                            dataSource={statistics.top_books}
                            rowKey="books_id"
                            {...sharedTableProps}
                        />
                    </Card>
                </div>

                {/* Right Column (Span 1) */}
                <div className="space-y-6">
                    {/* Active Readers */}
                    <Card bordered={false} className="shadow-lg shadow-gray-200/50 rounded-2xl overflow-hidden h-fit">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <UserCheck className="w-5 h-5 text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Bạn Đọc Tích Cực</h3>
                        </div>
                        <Table
                            columns={topReadersColumns}
                            dataSource={statistics.top_readers}
                            rowKey="user_id"
                            {...sharedTableProps}
                        />
                    </Card>

                     {/* Categories */}
                     <Card bordered={false} className="shadow-lg shadow-gray-200/50 rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-pink-50 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-pink-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Xu Hướng Thể Loại</h3>
                        </div>
                        <Table
                            columns={categoryColumns}
                            dataSource={statistics.category_ratio}
                            rowKey="category_name"
                            {...sharedTableProps}
                        />
                    </Card>
                </div>
            </div>
            
            {/* Bottom Section: Top Rated (Full Width) */}
            <Card bordered={false} className="shadow-lg shadow-gray-200/50 rounded-2xl overflow-hidden mb-10">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-yellow-50 rounded-lg">
                        <Star className="w-5 h-5 text-yellow-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Sách Được Đánh Giá Cao</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statistics.top_rated_books.slice(0, 4).map((book, idx) => (
                        <div key={book.books_id} className="group relative bg-white border border-gray-100 rounded-xl p-4 hover:border-indigo-100 hover:shadow-md transition-all">
                            <div className="flex gap-4">
                                <div className="relative w-16 h-24 flex-shrink-0 shadow-sm rounded-md overflow-hidden">
                                    <Image
                                        src={resolveImageSrc(book.image)}
                                        alt={book.book_title}
                                        fill
                                        sizes="80px"
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>
                                <div className="flex flex-col justify-between py-1">
                                    <div>
                                        <h4 className="font-semibold text-gray-800 line-clamp-2 text-sm group-hover:text-indigo-600 transition-colors">
                                            {book.book_title}
                                        </h4>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                            <span className="text-xs font-bold text-gray-700">{typeof book.avg_rating === 'number' ? book.avg_rating.toFixed(1) : parseFloat(book.avg_rating || '0').toFixed(1)}</span>
                                            <span className="text-xs text-gray-400">({book.total_reviews})</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400 bg-gray-50 self-start px-2 py-1 rounded-md">Top {idx + 1}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
}

// --- Sub-components for cleaner code ---

const StatsCard = ({ title, value, icon, gradient, trend }: any) => (
    <Card bordered={false} className="shadow-lg shadow-gray-200/60 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform`} />
        
        <div className="flex items-start justify-between relative z-10">
            <div>
                <p className="text-gray-500 font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-gray-800 tracking-tight">
                    {value.toLocaleString('vi-VN')}
                </h3>
                <div className="mt-2 flex items-center gap-1 text-xs font-medium text-gray-500">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{trend}</span>
                </div>
            </div>
            <div className={`p-3 rounded-xl shadow-md bg-gradient-to-br ${gradient}`}>
                {icon}
            </div>
        </div>
    </Card>
)