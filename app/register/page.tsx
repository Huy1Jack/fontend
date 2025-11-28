'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import { register_acc } from '@/app/actions/generalActions'
import { motion } from 'framer-motion'

const RegisterPage: React.FC = () => {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
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
        if (errors) setErrors('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors('')
        setSuccessMessage('')
        setIsLoading(true)

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setErrors('Mật khẩu xác nhận không khớp')
            setIsLoading(false)
            return
        }

        if (!formData.name || !formData.email || !formData.password) {
            setErrors('Vui lòng điền đầy đủ thông tin bắt buộc')
            setIsLoading(false)
            return
        }

        if (formData.password.length < 8) {
            setErrors('Mật khẩu phải có ít nhất 8 ký tự')
            setIsLoading(false)
            return
        }

        try {
            const data_user = {
                name: formData.name,
                email: formData.email,
                password: formData.password
            }

            const response = await register_acc(data_user)

            if (response.status === 200 || response.success === true) {
                setSuccessMessage('Đăng ký thành công! Đang chuyển hướng...')
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: ''
                })
                setTimeout(() => {
                    router.push('/login')
                }, 2000)
            } else {
                setErrors(response.message || 'Đăng ký thất bại')
            }
        } catch (error) {
            setErrors('Đăng ký thất bại, vui lòng thử lại sau.')
        }

        setIsLoading(false)
    }

    return (
        <div className="min-h-screen flex bg-white dark:bg-gray-950">
            {/* Left Side: Decorative Image/Brand */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/90 to-teal-900/90 z-10" />
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')" }}
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
                            "Hành trình vươn tới những đỉnh cao tri thức và danh hiệu cao quý bắt đầu từ đây. Hãy gia nhập cộng đồng sinh viên ưu tú."
                        </blockquote>
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                                {[4, 5, 6].map((i) => (
                                    <div key={i} className="h-10 w-10 rounded-full border-2 border-white/20 bg-gray-400 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="User" className="h-full w-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm font-medium text-green-100">
                                Kết nối cùng sinh viên toàn trường
                            </div>
                        </div>
                    </div>

                    <div className="text-sm text-green-100/60">
                        © 2025 Vinh University. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Side: Register Form */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-12 lg:p-24 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Tạo tài khoản mới
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Nhập thông tin cá nhân của bạn để bắt đầu.
                        </p>
                    </div>

                    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>

                        {/* Name Input */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Họ và tên
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <User className="h-5 w-5" />
                                </div>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="pl-10 h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-green-500 transition-all"
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>
                        </div>

                        {/* Email Input */}
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
                                    className="pl-10 h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-green-500 transition-all"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="pl-10 pr-10 h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-green-500 transition-all"
                                    placeholder="Tối thiểu 8 ký tự"
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

                        {/* Confirm Password Input */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Xác nhận mật khẩu
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="pl-10 pr-10 h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-green-500 transition-all"
                                    placeholder="Nhập lại mật khẩu"
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

                        {/* Messages */}
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

                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                    {successMessage}
                                </p>
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-medium bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-200"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    Đăng ký ngay
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>

                        {/* Divider */}
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-gray-950 text-gray-500">
                                    Đã có tài khoản?
                                </span>
                            </div>
                        </div>

                        {/* Login Link */}
                        <div className="text-center">
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 transition-all"
                            >
                                Quay lại đăng nhập
                            </Link>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    )
}

export default RegisterPage