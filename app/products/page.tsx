import { Metadata } from 'next'
import ProductsPage from '../components/ProductsPage'

export const metadata: Metadata = {
    title: 'Danh Mục Sách - Tìm Kiếm Và Mượn Sách Online',
    description: 'Khám phá hơn 100,000 đầu sách thuộc mọi lĩnh vực: Khoa học máy tính, Toán học, Vật lý, Văn học, Kinh tế. Mượn sách online miễn phí tại Thư viện Đại học Vinh.',
    keywords: [
        'danh mục sách đại học vinh',
        'tìm kiếm sách online',
        'mượn sách miễn phí',
        'sách khoa học máy tính',
        'sách toán học đại học',
        'tài liệu nghiên cứu',
        'giáo trình đại học'
    ],
    openGraph: {
        title: 'Danh Mục Sách Thư viện Đại học Vinh - 100,000+ Đầu Sách',
        description: 'Tìm kiếm và mượn sách online từ kho tàng tri thức khổng lồ. Sách giáo khoa, tài liệu nghiên cứu đa dạng lĩnh vực.',
    }
}

export default function Page() {
    return <ProductsPage />
}