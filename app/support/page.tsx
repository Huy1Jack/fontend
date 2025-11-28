import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Hỗ Trợ & Trợ Giúp - Thư Viện Số Đại Học Vinh | Hướng Dẫn Sử Dụng 24/7',
    description: 'Trung tâm hỗ trợ Thư viện số Đại học Vinh. Hướng dẫn mượn sách online, FAQ thường gặp, liên hệ hỗ trợ 24/7. Giải đáp mọi thắc mắc về sử dụng thư viện số.',
    keywords: [
        'hỗ trợ thư viện Đại học Vinh',
        'hướng dẫn mượn sách online',
        'FAQ thư viện số',
        'liên hệ thư viện',
        'hỗ trợ 24/7 Vinh University',
        'cách sử dụng thư viện số',
        'trợ giúp tìm kiếm sách',
        'hướng dẫn đăng ký thư viện'
    ],
    openGraph: {
        title: 'Trung Tâm Hỗ Trợ Thư Viện Số Đại Học Vinh - Giải Đáp 24/7',
        description: 'Nhận hỗ trợ tức thì cho mọi thắc mắc về thư viện số. Hướng dẫn chi tiết, FAQ và liên hệ trực tiếp với đội ngũ chuyên gia.',
        type: 'website',
        locale: 'vi_VN'
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Hỗ Trợ Thư Viện Số Đại Học Vinh 24/7',
        description: 'Trung tâm hỗ trợ và hướng dẫn sử dụng thư viện số toàn diện'
    }
}
export default function SupportPage() {
    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                        <span className="text-blue-600">Trung Tâm</span>
                        <br />
                        <span className="text-green-600">Hỗ Trợ</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Chúng tôi sẵn sàng hỗ trợ bạn 24/7. Tìm câu trả lời nhanh chóng
                        hoặc liên hệ trực tiếp với đội ngũ chuyên gia của chúng tôi.
                    </p>
                </div>

                {/* Quick Help Options */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-blue-50 p-8 rounded-2xl text-center">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-blue-900">FAQ - Câu Hỏi Thường Gặp</h3>
                        <p className="text-blue-800 mb-6">
                            Tìm câu trả lời nhanh chóng cho những câu hỏi phổ biến nhất
                        </p>
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            Xem FAQ
                        </button>
                    </div>

                    <div className="bg-green-50 p-8 rounded-2xl text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-green-900">Hướng Dẫn Sử Dụng</h3>
                        <p className="text-green-800 mb-6">
                            Video và tài liệu hướng dẫn chi tiết cách sử dụng thư viện số
                        </p>
                        <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                            Xem Hướng Dẫn
                        </button>
                    </div>

                    <div className="bg-purple-50 p-8 rounded-2xl text-center">
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-purple-900">Chat Trực Tiếp</h3>
                        <p className="text-purple-800 mb-6">
                            Liên hệ ngay với đội ngũ hỗ trợ qua chat hoặc hotline 24/7
                        </p>
                        <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                            Chat Ngay
                        </button>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center mb-12">Câu Hỏi Thường Gặp</h2>
                    <div className="space-y-6 max-w-4xl mx-auto">
                        <div className="bg-white border rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-3 text-gray-900">
                                Làm thế nào để đăng ký tài khoản thư viện số?
                            </h3>
                            <p className="text-gray-600">
                                Sinh viên và giảng viên Đại học Vinh có thể đăng ký trực tiếp bằng email trường (@vinhuni.edu.vn)
                                hoặc liên hệ phòng thư viện để được hỗ trợ. Quá trình đăng ký chỉ mất 2-3 phút và hoàn toàn miễn phí.
                            </p>
                        </div>

                        <div className="bg-white border rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-3 text-gray-900">
                                Tôi có thể mượn bao nhiêu cuốn sách cùng lúc?
                            </h3>
                            <p className="text-gray-600">
                                Sinh viên: tối đa 5 cuốn sách/lần, thời gian mượn 15 ngày.
                                Giảng viên: tối đa 10 cuốn sách/lần, thời gian mượn 30 ngày.
                                Có thể gia hạn thêm 2 lần nếu không có người đặt trước.
                            </p>
                        </div>

                        <div className="bg-white border rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-3 text-gray-900">
                                Làm sao để tìm kiếm sách hiệu quả trên hệ thống?
                            </h3>
                            <p className="text-gray-600">
                                Sử dụng từ khóa tiếng Việt hoặc tiếng Anh, tìm theo tác giả, tên sách, ISBN.
                                Hệ thống AI sẽ gợi ý sách liên quan và phân loại theo chuyên ngành.
                                Bạn cũng có thể lọc theo năm xuất bản, ngôn ngữ và định dạng.
                            </p>
                        </div>

                        <div className="bg-white border rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-3 text-gray-900">
                                Quy trình mượn sách online như thế nào?
                            </h3>
                            <p className="text-gray-600">
                                Bước 1: Đăng nhập tài khoản → Bước 2: Tìm và chọn sách →
                                Bước 3: Nhấn "Mượn sách" → Bước 4: Chọn thời gian nhận sách →
                                Bước 5: Nhận thông báo xác nhận. Sách sẽ được chuẩn bị sẵn tại quầy.
                            </p>
                        </div>

                        <div className="bg-white border rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-3 text-gray-900">
                                Tôi có thể đặt chỗ phòng học nhóm online không?
                            </h3>
                            <p className="text-gray-600">
                                Có, hệ thống hỗ trợ đặt phòng học nhóm 24/7. Chọn thời gian, số lượng người,
                                tiện ích cần thiết (máy chiếu, whiteboard, máy tính).
                                Đặt trước tối thiểu 2 giờ, tối đa 7 ngày. Miễn phí cho sinh viên và giảng viên.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="grid md:grid-cols-2 gap-12 mb-16">
                    <div>
                        <h2 className="text-3xl font-bold mb-8">Thông Tin Liên Hệ</h2>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Địa Chỉ</h3>
                                    <p className="text-gray-600">
                                        Tầng 5, Thư viện Trung tâm<br />
                                        182 Lê Duẩn, Thành phố Vinh, Nghệ An
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Điện Thoại</h3>
                                    <p className="text-gray-600">
                                        Hotline: <strong>1900-1234</strong> (24/7)<br />
                                        Văn phòng: <strong>(0238) 385-8500</strong>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Email</h3>
                                    <p className="text-gray-600">
                                        Hỗ trợ: <strong>support@library.vinhuni.edu.vn</strong><br />
                                        Tổng đài: <strong>info@library.vinhuni.edu.vn</strong>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Giờ Làm Việc</h3>
                                    <p className="text-gray-600">
                                        Thứ 2 - Thứ 6: 7:00 - 21:00<br />
                                        Thứ 7 - Chủ Nhật: 8:00 - 20:00<br />
                                        <span className="text-blue-600 font-medium">Hỗ trợ online: 24/7</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold mb-8">Gửi Tin Nhắn</h2>
                        <form className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Họ và tên *
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập họ và tên của bạn"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập địa chỉ email"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Loại yêu cầu
                                </label>
                                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option>Hỗ trợ kỹ thuật</option>
                                    <option>Hướng dẫn sử dụng</option>
                                    <option>Báo lỗi hệ thống</option>
                                    <option>Góp ý cải thiện</option>
                                    <option>Khác</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nội dung *
                                </label>
                                <textarea
                                    required
                                    rows={5}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Mô tả chi tiết vấn đề hoặc câu hỏi của bạn..."
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Gửi Tin Nhắn
                            </button>
                        </form>
                    </div>
                </div>

                {/* Additional Help Resources */}
                <div className="bg-gray-50 p-12 rounded-2xl">
                    <h2 className="text-3xl font-bold text-center mb-12">Tài Nguyên Hỗ Trợ Khác</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold mb-2">Chatbot AI</h3>
                            <p className="text-sm text-gray-600">Trợ lý ảo 24/7</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold mb-2">Video Hướng Dẫn</h3>
                            <p className="text-sm text-gray-600">Thư viện video HD</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className="font-semibold mb-2">Tài Liệu PDF</h3>
                            <p className="text-sm text-gray-600">Hướng dẫn chi tiết</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold mb-2">Cộng Đồng</h3>
                            <p className="text-sm text-gray-600">Diễn đàn thảo luận</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}