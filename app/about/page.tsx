import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Giới Thiệu - Thư Viện Số Đại Học Vinh | Hệ Thống Quản Lý Tri Thức Hiện Đại',
    description: 'Tìm hiểu về Thư viện số Đại học Vinh - hệ thống quản lý tri thức hiện đại nhất Bắc Trung Bộ. Lịch sử phát triển, sứ mệnh và tầm nhìn phục vụ 30,000+ sinh viên, giảng viên.',
    keywords: [
        'giới thiệu thư viện Đại học Vinh',
        'lịch sử thư viện số',
        'sứ mệnh thư viện đại học',
        'thư viện hiện đại Nghệ An',
        'hệ thống quản lý tri thức',
        'thư viện số Bắc Trung Bộ',
        'về chúng tôi Vinh University',
        'tầm nhìn thư viện'
    ],
    openGraph: {
        title: 'Giới Thiệu Thư Viện Số Đại Học Vinh - Hệ Thống Hiện Đại Nhất Miền Bắc',
        description: 'Khám phá lịch sử và sứ mệnh của Thư viện số Đại học Vinh, đơn vị tiên phong trong ứng dụng công nghệ số vào quản lý tri thức giáo dục.',
        type: 'website',
        locale: 'vi_VN'
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Giới Thiệu Thư Viện Số Đại Học Vinh',
        description: 'Thư viện số hiện đại nhất Bắc Trung Bộ với sứ mệnh phục vụ tri thức'
    }
}

export default function AboutPage() {
    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                        Về <span className="text-blue-600">Thư Viện Số</span>
                        <br />
                        <span className="text-green-600">Đại Học Vinh</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Khám phá hành trình phát triển của thư viện số hiện đại nhất
                        khu vực Bắc Trung Bộ, nơi tri thức và công nghệ hòa quyện
                    </p>
                </div>

                {/* Story Section */}
                <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
                    <div>
                        <h2 className="text-3xl font-bold mb-6">Câu Chuyện Của Chúng Tôi</h2>
                        <div className="space-y-4 text-gray-600">
                            <p>
                                <strong className="text-gray-900">Thư viện số Đại học Vinh</strong> được thành lập vào năm 2010
                                với tầm nhìn trở thành trung tâm tri thức số hàng đầu khu vực miền Bắc.
                                Từ những ngày đầu khởi tạo với chỉ 1,000 đầu sách điện tử,
                                chúng tôi đã không ngừng phát triển.
                            </p>
                            <p>
                                Ngày nay, với <strong>hơn 100,000 tài liệu số</strong> và phục vụ
                                <strong> 30,000+ người dùng</strong> bao gồm sinh viên, giảng viên,
                                nghiên cứu sinh và cán bộ nghiên cứu, chúng tôi tự hào là
                                <strong> thư viện số tiên phong</strong> trong việc ứng dụng công nghệ AI
                                và machine learning vào quản lý tri thức.
                            </p>
                            <p>
                                Đặc biệt, chúng tôi là thư viện đầu tiên tại Việt Nam triển khai
                                hệ thống <strong>mượn sách 24/7</strong> hoàn toàn tự động và
                                tích hợp chatbot AI hỗ trợ tìm kiếm thông minh.
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="bg-gradient-to-br from-blue-50 to-green-50 p-8 rounded-2xl">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-blue-600 mb-2">14+</div>
                                    <div className="text-sm text-gray-600">Năm Phát Triển</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-green-600 mb-2">100K+</div>
                                    <div className="text-sm text-gray-600">Tài Liệu Số</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-purple-600 mb-2">30K+</div>
                                    <div className="text-sm text-gray-600">Người Dùng</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
                                    <div className="text-sm text-gray-600">Hoạt Động</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mission & Vision */}
                <div className="grid md:grid-cols-2 gap-12 mb-16">
                    <div className="bg-blue-50 p-8 rounded-2xl">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-blue-900">Sứ Mệnh</h3>
                        <p className="text-blue-800">
                            Cung cấp dịch vụ thông tin và tri thức chất lượng cao, hiện đại và
                            dễ tiếp cận cho cộng đồng học thuật. Chúng tôi cam kết hỗ trợ
                            quá trình học tập, giảng dạy và nghiên cứu thông qua việc ứng dụng
                            công nghệ tiên tiến và phương pháp quản lý tri thức khoa học.
                        </p>
                    </div>
                    <div className="bg-green-50 p-8 rounded-2xl">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-green-900">Tầm Nhìn</h3>
                        <p className="text-green-800">
                            Trở thành thư viện số hàng đầu Đông Nam Á về chất lượng dịch vụ
                            và ứng dụng công nghệ. Đến năm 2030, chúng tôi sẽ là trung tâm
                            tri thức số kết nối các trường đại học trong khu vực, góp phần
                            nâng cao chất lượng giáo dục đại học Việt Nam.
                        </p>
                    </div>
                </div>

                {/* Values */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center mb-12">Giá Trị Cốt Lõi</h2>
                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-lg mb-2">Tận Tâm</h4>
                            <p className="text-sm text-gray-600">
                                Phục vụ người dùng với tinh thần trách nhiệm cao và sự tận tụy
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-lg mb-2">Đổi Mới</h4>
                            <p className="text-sm text-gray-600">
                                Luôn tiên phong ứng dụng công nghệ mới trong quản lý tri thức
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-lg mb-2">Tin Cậy</h4>
                            <p className="text-sm text-gray-600">
                                Đảm bảo tính chính xác và bảo mật thông tin tuyệt đối
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-lg mb-2">Hợp Tác</h4>
                            <p className="text-sm text-gray-600">
                                Xây dựng mối quan hệ đối tác bền vững với cộng đồng học thuật
                            </p>
                        </div>
                    </div>
                </div>

                {/* Team Leadership */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-12">Ban Lãnh Đạo</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border">
                            <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <span className="text-2xl font-bold text-blue-600">GS</span>
                            </div>
                            <h4 className="font-semibold text-lg mb-2">GS.TS Nguyễn Văn A</h4>
                            <p className="text-blue-600 font-medium mb-2">Giám Đốc Thư Viện</p>
                            <p className="text-sm text-gray-600">
                                20+ năm kinh nghiệm trong lĩnh vực quản lý thông tin và thư viện học
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border">
                            <div className="w-24 h-24 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <span className="text-2xl font-bold text-green-600">TS</span>
                            </div>
                            <h4 className="font-semibold text-lg mb-2">TS. Trần Thị B</h4>
                            <p className="text-green-600 font-medium mb-2">Phó Giám Đốc</p>
                            <p className="text-sm text-gray-600">
                                Chuyên gia công nghệ thông tin với 15+ năm kinh nghiệm phát triển hệ thống
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border">
                            <div className="w-24 h-24 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <span className="text-2xl font-bold text-purple-600">ThS</span>
                            </div>
                            <h4 className="font-semibold text-lg mb-2">ThS. Lê Văn C</h4>
                            <p className="text-purple-600 font-medium mb-2">Trưởng Phòng Kỹ Thuật</p>
                            <p className="text-sm text-gray-600">
                                Kỹ sư phần mềm hàng đầu chuyên về AI và machine learning
                            </p>
                        </div>
                    </div>
                </div>

                {/* Awards & Recognition */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-12 rounded-2xl">
                    <h2 className="text-3xl font-bold text-center mb-12">Thành Tựu & Giải Thưởng</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl mb-4">🏆</div>
                            <h4 className="font-semibold mb-2">Thư Viện Xuất Sắc 2023</h4>
                            <p className="text-sm text-gray-600">Bộ Giáo Dục & Đào Tạo</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-4">🥇</div>
                            <h4 className="font-semibold mb-2">Đổi Mới Sáng Tạo 2022</h4>
                            <p className="text-sm text-gray-600">Hội Thư Viện Việt Nam</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-4">⭐</div>
                            <h4 className="font-semibold mb-2">Top 10 Thư Viện Số</h4>
                            <p className="text-sm text-gray-600">Đông Nam Á 2021</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-4">🌟</div>
                            <h4 className="font-semibold mb-2">Chứng Nhận ISO 9001</h4>
                            <p className="text-sm text-gray-600">Quản Lý Chất Lượng</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}