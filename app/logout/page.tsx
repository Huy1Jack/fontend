'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../components/ui/Button'
import Link from 'next/link'

export default function LogoutPage() {
    const router = useRouter()

    useEffect(() => {
        // Redirect to home after 3 seconds
        const timer = setTimeout(() => {
            router.push('/')
        }, 3000)

        return () => clearTimeout(timer)
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-6 max-w-md mx-auto p-6">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">
                        Đăng xuất thành công
                    </h1>
                    <p className="text-muted-foreground">
                        Bạn đã được đăng xuất khỏi hệ thống.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Bạn sẽ được chuyển về trang chủ trong vài giây...
                    </p>
                </div>
                
                <div className="space-y-2">
                    <Button asChild className="w-full">
                        <Link href="/">
                            Về trang chủ ngay
                        </Link>
                    </Button>
                    
                    <Button variant="outline" asChild className="w-full">
                        <Link href="/login">
                            Đăng nhập lại
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
