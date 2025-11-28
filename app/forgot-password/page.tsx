'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ArrowLeft, Mail, Loader2, CheckCircle, AlertCircle, KeyRound } from 'lucide-react'
import { forgot_password } from '@/app/actions/generalActions'
import { motion } from 'framer-motion'

const ForgotPasswordPage: React.FC = () => {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: ''
    })
    const [errors, setErrors] = useState<string>('')
    const [successMessage, setSuccessMessage] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Xóa lỗi khi người dùng bắt đầu nhập lại
        if (errors) setErrors('')
        if (successMessage) setSuccessMessage('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors('')
        setSuccessMessage('')
        setIsLoading(true)

        if (!formData.email) {
            setErrors('Vui lòng nhập email')
            setIsLoading(false)
            return
        }

        try {
            const data_user = {
                email: formData.email
            }

            const response = await forgot_password(data_user)

            if (response.status === 200 || response.success === true) {
                setSuccessMessage('Chúng tôi đã gửi liên kết đặt lại mật khẩu vào email của bạn. Vui lòng kiểm tra hộp thư (cả mục spam).')
                setFormData({ email: '' })
            } else {
                setErrors(response.message || 'Không tìm thấy tài khoản với email này.')
            }
        } catch (error) {
            setErrors('Có lỗi xảy ra, vui lòng thử lại sau.')
        }

        setIsLoading(false)
    }

    return (
        <div className="min-h-screen flex bg-white dark:bg-gray-950">
            {/* Left Side: Decorative Image */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 to-blue-900/90 z-10" />
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')" }}
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
                            "Đừng lo lắng, việc quên mật khẩu xảy ra với tất cả mọi người. Chúng tôi sẽ giúp bạn lấy lại quyền truy cập chỉ trong vài bước đơn giản."
                        </blockquote>
                    </div>

                    <div className="text-sm text-indigo-200/60">
                        © 2025 Vinh University. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-12 lg:p-24 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center lg:text-left">
                        <div className="flex justify-center lg:justify-start mb-4">
                            <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <KeyRound className="h-6 w-6" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Quên mật khẩu?
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Không sao cả. Hãy nhập email đã đăng ký của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Email đăng ký
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
                                    className="pl-10 h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-indigo-500 transition-all"
                                    placeholder="name@example.com"
                                    disabled={isLoading || !!successMessage}
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {errors && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2"
                            >
                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                    {errors}
                                </p>
                            </motion.div>
                        )}

                        {/* Success Message */}
                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-4 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-start gap-3"
                            >
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                                        Đã gửi email!
                                    </p>
                                    <p className="text-sm text-green-700 dark:text-green-400">
                                        {successMessage}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        <div className="space-y-4">
                            {!successMessage ? (
                                <Button
                                    type="submit"
                                    className="w-full h-11 text-base font-medium bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-200"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Đang gửi...
                                        </>
                                    ) : (
                                        'Gửi liên kết xác nhận'
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={() => setSuccessMessage('')} // Cho phép nhập lại nếu muốn
                                    variant="outline"
                                    className="w-full h-11"
                                >
                                    Gửi lại bằng email khác
                                </Button>
                            )}

                            <div className="text-center">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Quay lại trang đăng nhập
                                </Link>
                            </div>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    )
}

export default ForgotPasswordPage