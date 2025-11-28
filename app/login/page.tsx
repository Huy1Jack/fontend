'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { login_acc } from '@/app/actions/generalActions'
import { setAuthCookie } from '@/app/actions/authActions'
import { motion } from 'framer-motion'

const LoginPage: React.FC = () => {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [errors, setErrors] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Xóa lỗi khi người dùng bắt đầu nhập lại
        if (errors) setErrors('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors('')
    setIsLoading(true)

    try {
        const data_user = {
            email: formData.email,
            password: formData.password
        }

        const response = await login_acc(data_user)

        if (response.status === 200) {
            if (response.data && response.data.token) {
                await setAuthCookie(response.data.token)
            }

            // 🔥 Không dùng router.push — reload toàn trang
            window.location.href = "/"
        } else {
            setErrors(response.message || 'Thông tin đăng nhập không đúng')
        }
    } catch (error) {
        setErrors('Có lỗi xảy ra, vui lòng thử lại sau.')
    }

    setIsLoading(false)
}


    return (
        <div className="min-h-screen flex bg-white dark:bg-gray-950">
            {/* Left Side: Decorative Image/Brand */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-purple-900/90 z-10" />
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497294815431-9365093b7331?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')" }}
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
                            "Hệ thống quản lý sinh viên xuất sắc và các giải thưởng danh giá. Nơi tôn vinh những nỗ lực không ngừng nghỉ."
                        </blockquote>
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-10 w-10 rounded-full border-2 border-white/20 bg-gray-400 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="h-full w-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm font-medium text-blue-100">
                                Được tin dùng bởi hàng ngàn sinh viên
                            </div>
                        </div>
                    </div>

                    <div className="text-sm text-blue-200/60">
                        © 2025 Vinh University. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-12 lg:p-24 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Chào mừng trở lại
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Vui lòng nhập thông tin để truy cập vào tài khoản của bạn.
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="pl-10 h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Mật khẩu
                                    </label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        required
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="pl-10 pr-10 h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {errors && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                            >
                                <p className="text-sm text-red-600 dark:text-red-400 text-center font-medium">
                                    {errors}
                                </p>
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-200"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    Đăng nhập
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-gray-950 text-gray-500">
                                    Chưa có tài khoản?
                                </span>
                            </div>
                        </div>

                        <div className="text-center">
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 transition-all"
                            >
                                Đăng ký tài khoản mới
                            </Link>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    )
}

export default LoginPage