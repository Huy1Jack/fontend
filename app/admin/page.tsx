"use client"

import React from 'react'
import { Button } from '../components/ui/Button'
import { BookOpen, Plus, Users, ClipboardList } from 'lucide-react'

export default function AdminPage() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Tổng số sách</p>
                            <p className="text-2xl font-semibold">1,248</p>
                        </div>
                        <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                </div>
                <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Đang mượn</p>
                            <p className="text-2xl font-semibold">132</p>
                        </div>
                        <ClipboardList className="h-6 w-6 text-primary" />
                    </div>
                </div>
                <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Người dùng</p>
                            <p className="text-2xl font-semibold">5,421</p>
                        </div>
                        <Users className="h-6 w-6 text-primary" />
                    </div>
                </div>
                <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Yêu cầu mới</p>
                            <p className="text-2xl font-semibold">8</p>
                        </div>
                        <Plus className="h-6 w-6 text-primary" />
                    </div>
                </div>
            </div>

            <div className="rounded-lg border">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-medium">Hành động nhanh</h2>
                    <div className="space-x-2">
                        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Thêm sách</Button>
                        <Button size="sm" variant="outline">Quản lý người dùng</Button>
                    </div>
                </div>
                <div className="p-4 text-sm text-muted-foreground">
                    Đây là trang demo. Kết nối API thực sẽ hiển thị dữ liệu động.
                </div>
            </div>

            <div className="rounded-lg border overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium">Mã</th>
                            <th className="px-4 py-2 text-left font-medium">Tiêu đề</th>
                            <th className="px-4 py-2 text-left font-medium">Tác giả</th>
                            <th className="px-4 py-2 text-left font-medium">Trạng thái</th>
                            <th className="px-4 py-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { id: 'BK001', title: 'Giải tích 12', author: 'Nhiều tác giả', status: 'Có sẵn' },
                            { id: 'BK002', title: 'Đại số tuyến tính', author: 'Nguyễn Văn A', status: 'Đang mượn' },
                            { id: 'BK003', title: 'Cấu trúc dữ liệu', author: 'Trần Thị B', status: 'Có sẵn' },
                        ].map((book) => (
                            <tr key={book.id} className="border-t">
                                <td className="px-4 py-2">{book.id}</td>
                                <td className="px-4 py-2">{book.title}</td>
                                <td className="px-4 py-2">{book.author}</td>
                                <td className="px-4 py-2">
                                    <span className={
                                        book.status === 'Có sẵn'
                                            ? 'text-green-600'
                                            : 'text-amber-600'
                                    }>
                                        {book.status}
                                    </span>
                                </td>
                                <td className="px-4 py-2 text-right">
                                    <Button size="sm" variant="outline">Sửa</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}


