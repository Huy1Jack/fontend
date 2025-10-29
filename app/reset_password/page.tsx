"use client";

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { check_token_reset, set_newpass } from '@/app/sever/route'

export default function ResetPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [isVerifying, setIsVerifying] = useState(true)
    const [isValid, setIsValid] = useState(false)
    const [error, setError] = useState<string>('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false) // State mới để kiểm soát popup thành công
    const [countdown, setCountdown] = useState(5)

    const token = searchParams.get('token') || ''

    // Logic kiểm tra token ban đầu
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setError('Yêu cầu không hợp lệ. Thiếu token.')
                setIsVerifying(false)
                setIsValid(false)
                setTimeout(() => {
                    router.push('/')
                }, 3000)
                return
            }

            try {
                const res = await check_token_reset({ token })
                const ok = res?.success === true || res?.status === 200
                if (ok) {
                    setIsValid(true)
                } else {
                    setError('Yêu cầu không hợp lệ.')
                    setIsValid(false)
                    setTimeout(() => {
                        router.push('/')
                    }, 3000)
                }
            } catch (e: any) {
                setError('Yêu cầu không hợp lệ.')
                setIsValid(false)
                setTimeout(() => {
                    router.push('/')
                }, 3000)
            } finally {
                setIsVerifying(false)
            }
        }
        verifyToken()
    }, [token, router])

    // Logic đếm ngược và chuyển hướng
    useEffect(() => {
        let timer: NodeJS.Timeout
        if (isSuccess && countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(prev => prev - 1)
            }, 1000)
        } else if (isSuccess && countdown === 0) {
            router.push('/')
        }
        return () => clearTimeout(timer)
    }, [isSuccess, countdown, router])

    // Xử lý khi người dùng gửi form
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password.length < 8) {
            setError('Mật khẩu phải có ít nhất 8 ký tự.')
            return
        }
        if (password !== confirmPassword) {
            setError('Mật khẩu nhập lại không khớp.')
            return
        }

        setSubmitting(true)
        try {
            const res = await set_newpass({ password, token })
            const ok = res?.success === true || res?.status === 200
            if (ok) {
                setIsSuccess(true) // Kích hoạt popup thành công
                // router.push() được gọi trong useEffect sau khi đếm ngược
            } else {
                setError(res?.message || 'Đặt lại mật khẩu thất bại. Thử lại sau.')
            }
        } catch (e: any) {
            setError('Đặt lại mật khẩu thất bại. Thử lại sau.')
        } finally {
            setSubmitting(false)
        }
    }

    // --- RENDER CÁC TRẠNG THÁI GIAO DIỆN ---

    // 1. Trạng thái Loading/Đang xác thực
    if (isVerifying) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center p-4 bg-gray-50">
                <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 text-center shadow-lg border-t-4 border-blue-500">
                    <div className="flex justify-center">
                        <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <div className="text-lg font-medium text-gray-700">Đang xác thực yêu cầu…</div>
                    <p className="text-sm text-gray-500">Vui lòng chờ, hệ thống đang kiểm tra liên kết của bạn.</p>
                </div>
            </div>
        )
    }

    // 2. Trạng thái lỗi không hợp lệ
    if (!isValid) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center p-4 bg-gray-50">
                <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 text-center shadow-lg border-t-4 border-red-500">
                    <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.503-1.688 1.796-3.118l-6.928-14a2.985 2.985 0 00-2.692 0l-6.928 14c-.707 1.43.246 3.118 1.796 3.118z"></path>
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-red-700">Yêu cầu không hợp lệ</h1>
                    <p className="text-gray-600">{error || 'Liên kết này đã hết hạn hoặc không tồn tại.'}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="mt-4 w-full rounded-xl bg-gray-200 px-6 py-3 text-gray-700 font-semibold hover:bg-gray-300 transition-colors shadow-md"
                    >
                        Về Trang Chủ
                    </button>
                </div>
            </div>
        )
    }

    // 3. Trạng thái thành công (Popup mới)
    if (isSuccess) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center p-4 bg-gray-50">
                <div className="w-full max-w-md space-y-6 rounded-3xl bg-white p-8 text-center shadow-2xl border-t-4 border-green-500">
                    <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Hoàn tất!</h1>
                    <p className="text-gray-600">
                        Mật khẩu của bạn đã được cập nhật thành công. 
                        Bạn sẽ được chuyển về trang chủ sau <span className="text-blue-600 font-bold">{countdown}</span> giây.
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition-colors shadow-md"
                    >
                        Về trang chủ ngay
                    </button>
                </div>
            </div>
        )
    }

    // 4. Trạng thái form chính để nhập mật khẩu mới
    return (
        <div className="flex min-h-[80vh] items-center justify-center p-4 bg-gray-50">
            <form onSubmit={onSubmit} className="w-full max-w-lg space-y-6 rounded-3xl bg-white p-8 shadow-2xl transition-all duration-300">
                <hgroup className='text-center'>
                    <h1 className="text-3xl font-extrabold text-gray-900">Đặt Lại Mật Khẩu</h1>
                    <p className="text-gray-500 mt-2">Nhập mật khẩu mới (tối thiểu 8 ký tự).</p>
                </hgroup>

                {error && (
                    <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 font-medium transition-opacity duration-300">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 block" htmlFor="password">
                        Mật khẩu mới
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-5 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 bg-white text-gray-900 transition-colors shadow-sm"
                        placeholder="••••••••"
                        required
                        minLength={8}
                        disabled={submitting}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 block" htmlFor="confirmPassword">
                        Nhập lại mật khẩu mới
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-5 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 bg-white text-gray-900 transition-colors shadow-sm"
                        placeholder="••••••••"
                        required
                        minLength={8}
                        disabled={submitting}
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting || password.length < 8 || password !== confirmPassword}
                    className="w-full rounded-xl bg-blue-600 px-6 py-3 text-lg text-white font-bold hover:bg-blue-700 transition-all duration-200 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-95"
                >
                    {submitting ? (
                        <div className="flex items-center justify-center space-x-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Đang cập nhật…</span>
                        </div>
                    ) : 'Cập Nhật Mật Khẩu'}
                </button>
            </form>
        </div>
    )
}