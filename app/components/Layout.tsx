'use client'

import React from 'react'
import Header from './Header'
import Footer from './Footer'
import { usePathname } from 'next/navigation'

interface LayoutProps {
    children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
    const pathname = usePathname()
    const isAdmin = pathname?.startsWith('/admin')
    return (
        <div className="min-h-screen flex flex-col">
            {!isAdmin && <Header />}
            <main className="flex-1">
                {children}
            </main>
            {!isAdmin && <Footer />}
        </div>
    )
}