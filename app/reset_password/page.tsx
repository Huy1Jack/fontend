'use client';

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react'
import { check_token_reset, set_newpass } from '@/app/actions/generalActions'
import { motion } from 'framer-motion'

export default function ResetPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Logic States
    const [isVerifying, setIsVerifying] = useState(true)
    const [isValid, setIsValid] = useState(false)
    const [error, setError] = useState<string>('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [countdown, setCountdown] = useState(5)

    // UI States (Mới thêm)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const token = searchParams.get('token') || ''

    // Logic 1: Kiểm tra token
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setError('Đường dẫn không hợp lệ hoặc bị thiếu token.')
                setIsVerifying(false)
                setIsValid(false)
                // Tự động redirect sau 3s nếu lỗi token (optional)
                setTimeout(() => router.push('/login'), 3000)
                return
            }

            try {
                const res = await check_token_reset({ token })
                const ok = res?.success === true || res?.status === 200
                if (ok) {
                    setIsValid(true)
                } else {
                    setError('Đường dẫn đặt lại mật khẩu đã hết hạn hoặc không tồn tại.')
                    setIsValid(false)
                }
            } catch (e: any) {
                setError('Có lỗi xảy ra khi xác thực yêu cầu.')
                setIsValid(false)
            } finally {
                setIsVerifying(false)
            }
        }
        verifyToken()
    }, [token, router])

    // Logic 2: Đếm ngược
    useEffect(() => {
        let timer: NodeJS.Timeout
        if (isSuccess && countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(prev => prev - 1)
            }, 1000)
        } else if (isSuccess && countdown === 0) {
            router.push('/login') // Chuyển về login thay vì home để user đăng nhập lại
        }
        return () => clearTimeout(timer)
    }, [isSuccess, countdown, router])

    // Logic 3: Submit Form
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password.length < 8) {
            setError('Mật khẩu phải có ít nhất 8 ký tự.')
            return
        }
        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.')
            return
        }

        setSubmitting(true)
        try {
            const res = await set_newpass({ password, token })
            const ok = res?.success === true || res?.status === 200
            if (ok) {
                setIsSuccess(true)
            } else {
                setError(res?.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.')
            }
        } catch (e: any) {
            setError('Lỗi kết nối. Vui lòng thử lại sau.')
        } finally {
            setSubmitting(false)
        }
    }

    // --- RENDER CONTENT BASED ON STATE ---
    const renderContent = () => {
        // 1. Trạng thái đang tải (Verifying Token)
        if (isVerifying) {
            return (
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Đang xác thực...</h2>
                    <p className="text-gray-500 dark:text-gray-400">Vui lòng đợi trong giây lát, hệ thống đang kiểm tra liên kết của bạn.</p>
                </div>
            )
        }

        // 2. Trạng thái Token không hợp lệ
        if (!isValid) {
            return (
                <div className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="h-16 w-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Liên kết không hợp lệ</h2>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">{error}</p>
                    </div>
                    <Button onClick={() => router.push('/login')} variant="outline" className="w-full">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại trang đăng nhập
                    </Button>
                </div>
            )
        }

        // 3. Trạng thái Thành công
        if (isSuccess) {
            return (
                <div className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="h-16 w-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Đổi mật khẩu thành công!</h2>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                            Tài khoản của bạn đã được cập nhật mật khẩu mới. <br />
                            Tự động chuyển trang sau <span className="font-bold text-blue-600">{countdown}s</span>
                        </p>
                    </div>
                    <Button onClick={() => router.push('/login')} className="w-full bg-blue-600 hover:bg-blue-700">
                        Đăng nhập ngay
                    </Button>
                </div>
            )
        }

        // 4. Trạng thái Form nhập mật khẩu (Default)
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md space-y-8"
            >
                <div className="text-center lg:text-left">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Đặt lại mật khẩu
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
                    </p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={onSubmit}>

                    {/* New Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Mật khẩu mới
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Lock className="h-5 w-5" />
                            </div>
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 pr-10 h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Xác nhận mật khẩu
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pl-10 pr-10 h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                        >
                            <p className="text-sm text-red-600 dark:text-red-400 text-center font-medium">
                                {error}
                            </p>
                        </motion.div>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full h-11 text-base font-medium bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-200"
                        disabled={submitting || password.length < 8 || password !== confirmPassword}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang cập nhật...
                            </>
                        ) : (
                            'Đổi mật khẩu'
                        )}
                    </Button>

                    <div className="text-center">
                        <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                            ← Quay lại đăng nhập
                        </Link>
                    </div>
                </form>
            </motion.div>
        )
    }

    return (
        <div className="min-h-screen flex bg-white dark:bg-gray-950">
            {/* Left Side: Decorative Image */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-slate-900/90 z-10" />
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')" }}
                />
                <div className="relative z-20 flex flex-col justify-between w-full h-full p-12 text-white">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded bg-white/20 backdrop-blur flex items-center justify-center">
                            <span className="font-bold">V</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">VinhUni System</span>
                    </div>

                    <div className="space-y-6">
                        <blockquote className="text-2xl font-medium leading-relaxed">
                            "Bảo mật thông tin là ưu tiên hàng đầu của chúng tôi. Hãy đảm bảo mật khẩu mới của bạn đủ mạnh và an toàn."
                        </blockquote>
                    </div>

                    <div className="text-sm text-blue-200/60">
                        © 2025 Vinh University. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Side: Dynamic Content */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-12 lg:p-24 relative">
                <div className="w-full max-w-md">
                    {renderContent()}
                </div>
            </div>
        </div>
    )
}