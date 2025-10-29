'use client'

import React, { useState } from 'react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Eye, EyeOff } from 'lucide-react'
import { login_acc, register_acc, forgot_password} from '@/app/sever/route'
import { setAuthCookie } from '@/app/sever/authcookie/route'

interface AuthModalProps {
    onClose: () => void
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const [isLogin, setIsLogin] = useState(true)
    const [showForgotPassword, setShowForgotPassword] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        studentId: '',
        department: '',
        resetEmail: ''
    })
    const [errors, setErrors] = useState<string>('')
    const [resetMessage, setResetMessage] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors('')
        setResetMessage('')
        setIsLoading(true)

        if (!formData.resetEmail) {
            setErrors('Vui lòng nhập email')
            setIsLoading(false)
            return
        }

        try {
            const data_user = {
                email: formData.resetEmail
            }
            
            const response = await forgot_password(data_user)
            
            if (response.status === 200 || response.success === true) {
                // Success - show success message
                setResetMessage('Vui lòng kiểm tra email để đặt lại mật khẩu')
                // Clear the email field
                setFormData(prev => ({ ...prev, resetEmail: '' }))
                // Auto hide message and switch back to login after 5 seconds
                setTimeout(() => {
                    setShowForgotPassword(false)
                    setResetMessage('')
                }, 5000)
            } else {
                // Failed - show error message
                setErrors(response.message || 'Không thể gửi email đặt lại mật khẩu')
            }
        } catch (error) {
            setErrors('Không thể gửi email đặt lại mật khẩu')
        }
        
        setIsLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors('')
        setResetMessage('')
        setIsLoading(true)

        if (isLogin) {
            try {
                const data_user = {
                    email: formData.email,
                    password: formData.password
                }
                
                const response = await login_acc(data_user)
                
                if (response.status === 200) {
                    // Login successful, set the JWT token in cookie if provided
                    if (response.data && response.data.token) {
                        await setAuthCookie(response.data.token)
                    }
                    // Reload the page to refresh authentication state
                    window.location.reload()
                } else {
                    // Login failed, show error message
                    setErrors(response.message || 'Thông tin đăng nhập không đúng')
                }
            } catch (error) {
                setErrors('Thông tin đăng nhập không đúng')
            }
            setIsLoading(false)
        } else {
            // Registration logic
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

            try {
                const data_user = {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                }
                
                const response = await register_acc(data_user)
                
                if (response.status === 200 || response.success === true) {
                    // Registration successful, switch to login form
                    setIsLogin(true)
                    setErrors('')
                    setResetMessage('Đăng ký thành công! Vui lòng đăng nhập.')
                    // Clear form data
                    setFormData({
                        name: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                        studentId: '',
                        department: '',
                        resetEmail: ''
                    })
                    // Auto hide success message after 3 seconds
                    setTimeout(() => {
                        setResetMessage('')
                    }, 3000)
                } else {
                    // Registration failed, show error message
                    setErrors(response.message || 'Đăng ký thất bại')
                }
            } catch (error) {
                setErrors('Đăng ký thất bại')
            }
            setIsLoading(false)
        }
    }

    // Reset form when switching between modes
    const handleModeSwitch = (mode: 'login' | 'register' | 'forgot') => {
        setErrors('')
        setResetMessage('')
        setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            studentId: '',
            department: '',
            resetEmail: ''
        })

        if (mode === 'login') {
            setIsLogin(true)
            setShowForgotPassword(false)
        } else if (mode === 'register') {
            setIsLogin(false)
            setShowForgotPassword(false)
        } else if (mode === 'forgot') {
            setShowForgotPassword(true)
        }
    }

    if (showForgotPassword) {
        return (
            <div className="w-full">
                <div className="px-4 py-3 border-b">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Quên mật khẩu</h3>
                        <button
                            onClick={() => handleModeSwitch('login')}
                            className="text-xs text-muted-foreground hover:text-foreground"
                        >
                            ← Quay lại đăng nhập
                        </button>
                    </div>
                </div>

                <form onSubmit={handleForgotPassword} className="p-4 space-y-3">
                    <div className="text-sm text-muted-foreground mb-3">
                        Nhập email của bạn, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.
                    </div>

                    <div>
                        <Input
                            type="email"
                            name="resetEmail"
                            placeholder="Email của bạn"
                            value={formData.resetEmail}
                            onChange={handleInputChange}
                            required
                            className="text-sm"
                        />
                    </div>

                    {errors && (
                        <div className="text-red-500 text-xs">{errors}</div>
                    )}

                    {resetMessage && (
                        <div className="text-green-500 text-xs">{resetMessage}</div>
                    )}

                    <Button type="submit" className="w-full text-sm" disabled={isLoading}>
                        {isLoading ? 'Đang gửi...' : 'Gửi email đặt lại'}
                    </Button>
                </form>
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="px-4 py-3 border-b">
                <div className="flex space-x-1">
                    <button
                        onClick={() => handleModeSwitch('login')}
                        className={`px-3 py-1 text-sm font-medium rounded ${isLogin
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Đăng nhập
                    </button>
                    <button
                        onClick={() => handleModeSwitch('register')}
                        className={`px-3 py-1 text-sm font-medium rounded ${!isLogin
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Đăng ký
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3">

                {!isLogin && (
                    <div>
                        <Input
                            type="text"
                            name="name"
                            placeholder="Họ và tên *"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="text-sm"
                        />
                    </div>
                )}

                <div>
                    <Input
                        type="email"
                        name="email"
                        placeholder="Email *"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="text-sm"
                    />
                </div>

                <div className="relative">
                    <Input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Mật khẩu *"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="text-sm pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                    </button>
                </div>

                {!isLogin && (
                    <>
                        <div className="relative">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                placeholder="Xác nhận mật khẩu *"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                                className="text-sm pr-10"
                            />
                        </div>


                    </>
                )}

                {errors && (
                    <div className="text-red-500 text-xs">{errors}</div>
                )}

                {resetMessage && (
                    <div className="text-green-500 text-xs">{resetMessage}</div>
                )}

                <Button type="submit" className="w-full text-sm" disabled={isLoading}>
                    {isLoading
                        ? (isLogin ? 'Đang đăng nhập...' : 'Đang đăng ký...')
                        : (isLogin ? 'Đăng nhập' : 'Đăng ký')
                    }
                </Button>

                {isLogin && (
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => handleModeSwitch('forgot')}
                            className="text-xs text-primary hover:underline"
                        >
                            Quên mật khẩu?
                        </button>
                    </div>
                )}
            </form>
        </div>
    )
}

export default AuthModal