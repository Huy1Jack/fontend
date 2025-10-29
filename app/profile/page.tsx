import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Hồ Sơ Cá Nhân - Thư Viện Số Đại Học Vinh | Quản Lý Tài Khoản',
    description: 'Quản lý hồ sơ cá nhân tại Thư viện số Đại học Vinh. Cập nhật thông tin, xem lịch sử mượn sách, gia hạn sách, đổi mật khẩu và cài đặt tài khoản.',
    keywords: [
        'hồ sơ cá nhân thư viện',
        'quản lý tài khoản Vinh University',
        'lịch sử mượn sách',
        'gia hạn sách online',
        'đổi mật khẩu thư viện',
        'cập nhật thông tin sinh viên',
        'my profile library'
    ],
    robots: {
        index: false,
        follow: true,
    }
}

export default function ProfilePage() {
    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold mb-4">Hồ Sơ Cá Nhân</h1>
                    <p className="text-gray-600">
                        Quản lý thông tin tài khoản và hoạt động thư viện của bạn
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Sidebar */}
                    <div className="bg-white rounded-lg border p-6">
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-blue-600">SV</span>
                            </div>
                            <h3 className="font-semibold">Sinh viên</h3>
                            <p className="text-sm text-gray-600">ID: SV2024001</p>
                        </div>
                        <nav className="space-y-2">
                            <a href="#" className="block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg">
                                Thông tin cá nhân
                            </a>
                            <a href="#" className="block px-4 py-2 hover:bg-gray-50 rounded-lg">
                                Sách đang mượn
                            </a>
                            <a href="#" className="block px-4 py-2 hover:bg-gray-50 rounded-lg">
                                Lịch sử mượn
                            </a>
                            <a href="#" className="block px-4 py-2 hover:bg-gray-50 rounded-lg">
                                Phòng đã đặt
                            </a>
                            <a href="#" className="block px-4 py-2 hover:bg-gray-50 rounded-lg">
                                Đổi mật khẩu
                            </a>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-2 bg-white rounded-lg border p-6">
                        <h2 className="text-2xl font-bold mb-6">Thông Tin Cá Nhân</h2>
                        <form className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Họ và tên
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="Nguyễn Văn A"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mã sinh viên
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="SV2024001"
                                        disabled
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        defaultValue="nguyenvana@vinhuni.edu.vn"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Số điện thoại
                                    </label>
                                    <input
                                        type="tel"
                                        defaultValue="0987654321"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Khoa
                                    </label>
                                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option>Khoa Công nghệ thông tin</option>
                                        <option>Khoa Toán - Tin</option>
                                        <option>Khoa Vật lý</option>
                                        <option>Khoa Hóa học</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Năm học
                                    </label>
                                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option>2024-2025</option>
                                        <option>2023-2024</option>
                                        <option>2022-2023</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Địa chỉ
                                </label>
                                <textarea
                                    rows={3}
                                    defaultValue="123 Đường ABC, Phường XYZ, Thành phố Vinh, Nghệ An"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                ></textarea>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Cập nhật thông tin
                                </button>
                                <button
                                    type="button"
                                    className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-4 gap-6 mt-12">
                    <div className="bg-white rounded-lg border p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
                        <div className="text-sm text-gray-600">Sách đang mượn</div>
                    </div>
                    <div className="bg-white rounded-lg border p-6 text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">27</div>
                        <div className="text-sm text-gray-600">Sách đã mượn</div>
                    </div>
                    <div className="bg-white rounded-lg border p-6 text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-2">5</div>
                        <div className="text-sm text-gray-600">Phòng đã đặt</div>
                    </div>
                    <div className="bg-white rounded-lg border p-6 text-center">
                        <div className="text-3xl font-bold text-orange-600 mb-2">12</div>
                        <div className="text-sm text-gray-600">Điểm tích lũy</div>
                    </div>
                </div>
            </div>
        </div>
    )
}