import React from 'react'
import AdminSidebar from '../components/admin/AdminSidebar'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <section className="relative">
            <AdminSidebar />
            <div className="ml-14 md:ml-56 px-4 py-6">
                <div className="mx-auto w-full max-w-7xl">
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold tracking-tight">Bảng điều khiển quản trị</h1>
                        <p className="text-sm text-muted-foreground">Khu vực quản lý dành cho thủ thư và quản trị viên.</p>
                    </div>
                    {children}
                </div>
            </div>
        </section>
    )
}


