'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from '../../lib/hooks/useTheme'
import { useAuth } from '../../lib/hooks/useAuth'
import { useBorrow } from '../../lib/hooks/useBorrow'
import { ShoppingCart, Sun, Moon, User, LogOut, Package, BookOpen, Search } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { UserRole } from '../../lib/types'
import AuthModal from './AuthModal'
import { show_book_search } from "@/app/sever/route";






const Header: React.FC = () => {
    const { theme, setTheme } = useTheme()
    const { user, logout } = useAuth()
    const { borrowedCount } = useBorrow()
    const pathname = usePathname()
    const router = useRouter()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const menuRef = useRef<HTMLDivElement>(null)
    
    const handleLogout = async () => {
        await logout()
        setIsMenuOpen(false)
        router.push('/logout')
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchTerm.trim() !== '') {
            router.push(`/books?search=${encodeURIComponent(searchTerm.trim())}`)
            setSearchTerm('')
        }
        }

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false)
    }, [pathname])

    const isActivePath = (path: string) => {
        if (path === '/' && pathname === '/') return true
        if (path !== '/' && pathname.startsWith(path)) return true
        return false
    }

    const navLinkClasses = (path: string) =>
        `text-sm font-medium transition-colors hover:text-primary ${isActivePath(path) ? 'text-primary' : 'text-muted-foreground'
        }`

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background">
            <div className="container flex items-center h-16 max-w-7xl mx-auto px-4">
                {/* Logo */}
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    <Image src="/logo/logo.svg" alt="Logo Đại học Vinh" width={32} height={32} className="h-8 w-8" />
                    <span className="font-bold">Thư viện Số VU</span>
                </Link>

                {/* Navbar */}
                <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                    <Link href="/" className={navLinkClasses('/')}>Trang Chủ</Link>
                    <Link href="/books" className={navLinkClasses('/books')}>Sách</Link>

                    <Link href="/about" className={navLinkClasses('/about')}>Giới Thiệu</Link>
                    {(user?.role === UserRole.LIBRARIAN || user?.role === UserRole.ADMIN) && (
                        <Link href="/admin" className={navLinkClasses('/admin')}>Quản Lý</Link>
                    )}
                </nav>

                {/* Thanh tìm kiếm */}
                <form
                    onSubmit={handleSearch}
                    className="ml-[300px] hidden md:flex flex-1 max-w-md mx-6 relative items-center"
                >
                    <Input
                        type="text"
                        placeholder="Tìm kiếm sách..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-800px rounded-md border border-gray-300 dark:border-gray-700 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Search className="absolute left-3 text-gray-800 h-4 w-4" />
                </form>

                {/* Các nút chức năng bên phải */}
                <div className="flex items-center justify-end space-x-2 sm:space-x-4">
                    {/* <Link href="/my-books" className="relative p-2" title="Sách đã mượn">
                        <BookOpen className="h-5 w-5" />
                        {borrowedCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                                {borrowedCount}
                            </span>
                        )}
                    </Link> */}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>

                    <div className="relative" ref={menuRef}>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center"
                        >
                            <User className="h-5 w-5" />
                        </Button>

                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border">
                                {user ? (
                                    <>
                                        <div className="px-4 py-2 border-b">
                                            <p className="text-sm font-medium">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                        <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Hồ sơ cá nhân</Link>
                                        <Link href="/my-books" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Sách đã mượn</Link>
                                        <hr className="my-1" />
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Đăng xuất
                                        </button>
                                    </>
                                ) : (
                                    <AuthModal onClose={() => setIsMenuOpen(false)} />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
