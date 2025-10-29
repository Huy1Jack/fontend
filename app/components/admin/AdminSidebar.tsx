'use client'

import React, { useState, useEffect } from 'react'
import { Menu, X, LayoutDashboard, BookOpen, ClipboardList, Users, Settings, UserCog, BookmarkIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminSidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(true)

    useEffect(() => {
        const stored = typeof window !== 'undefined' ? window.localStorage.getItem('adminSidebarOpen') : null
        if (stored !== null) setIsOpen(stored === '1')
    }, [])

    useEffect(() => {
        if (typeof window !== 'undefined') window.localStorage.setItem('adminSidebarOpen', isOpen ? '1' : '0')
    }, [isOpen])

    const NavItem = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
        const active = pathname === href || pathname?.startsWith(href + '/')
        return (
            <Link
                href={href}
                className={`flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${active ? 'bg-accent text-accent-foreground' : ''}`}
            >
                <Icon className="h-4 w-4" />
                {isOpen && <span>{label}</span>}
            </Link>
        )
    }

    return (
        <aside className={`fixed left-0 top-0 z-40 h-screen border-r bg-background ${isOpen ? 'w-56' : 'w-14'} transition-[width] duration-200`}> 
            <div className="flex h-14 items-center justify-between px-3 border-b">
                <button
                    aria-label="Toggle sidebar"
                    className="inline-flex h-9 w-9 items-center justify-center rounded hover:bg-accent"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
                {isOpen && <span className="text-sm font-semibold">Quản trị</span>}
            </div>

            <nav className="p-2 space-y-1">
                <NavItem href="/admin" label="Tổng quan" icon={LayoutDashboard} />
                <NavItem href="/admin/books" label="Sách" icon={BookOpen} />
                <NavItem href="/admin/categories" label="Thể loại" icon={BookmarkIcon} />
                <NavItem href="/admin/author" label="Tác giả" icon={UserCog} />
                <NavItem href="/admin/borrows" label="Mượn trả" icon={ClipboardList} />
                <NavItem href="/admin/users" label="Người dùng" icon={Users} />
                <NavItem href="/admin/settings" label="Cài đặt" icon={Settings} />
            </nav>
        </aside>
    )
}



