import { Book, User, BorrowRecord, UserRole, BorrowStatus, LibraryNews } from './types'

export const MOCK_BOOKS: Book[] = [
    {
        id: '1',
        title: 'Cấu Trúc Dữ Liệu và Giải Thuật',
        author: 'Nguyễn Văn A',
        publisher: 'NXB Đại học Quốc gia',
        publishYear: 2023,
        isbn: '978-604-73-8234-5',
        category: 'Khoa học máy tính',
        description: 'Cuốn sách cung cấp kiến thức cơ bản về cấu trúc dữ liệu và các thuật toán quan trọng trong lập trình.',
        coverUrl: 'https://picsum.photos/seed/book1/300/400',
        totalCopies: 15,
        availableCopies: 8,
        rating: 4.8,
        reviews: 120,
        tags: ['lập trình', 'thuật toán', 'khoa học máy tính']
    },
    {
        id: '2',
        title: 'Lịch Sử Việt Nam Hiện Đại',
        author: 'Trần Thị B',
        publisher: 'NXB Giáo dục',
        publishYear: 2022,
        isbn: '978-604-32-1567-8',
        category: 'Lịch sử',
        description: 'Tìm hiểu về lịch sử Việt Nam từ thế kỷ 19 đến nay qua các sự kiện quan trọng.',
        coverUrl: 'https://picsum.photos/seed/book2/300/400',
        totalCopies: 30,
        availableCopies: 25,
        rating: 4.6,
        reviews: 250,
        tags: ['lịch sử', 'việt nam', 'hiện đại']
    },
    {
        id: '3',
        title: 'Toán Cao Cấp A1',
        author: 'Phạm Văn C',
        publisher: 'NXB Bách khoa Hà Nội',
        publishYear: 2023,
        isbn: '978-604-95-1234-7',
        category: 'Toán học',
        description: 'Giáo trình toán cao cấp dành cho sinh viên năm thứ nhất các ngành kỹ thuật.',
        coverUrl: 'https://picsum.photos/seed/book3/300/400',
        totalCopies: 50,
        availableCopies: 30,
        rating: 4.9,
        reviews: 400,
        tags: ['toán học', 'cao cấp', 'kỹ thuật']
    },
    {
        id: '4',
        title: 'Văn Học Việt Nam Hiện Đại',
        author: 'Lê Thị D',
        publisher: 'NXB Văn học',
        publishYear: 2021,
        isbn: '978-604-56-7890-1',
        category: 'Văn học',
        description: 'Khảo sát panorama văn học Việt Nam từ đầu thế kỷ 20 đến nay.',
        coverUrl: 'https://picsum.photos/seed/book4/300/400',
        totalCopies: 45,
        availableCopies: 20,
        rating: 4.7,
        reviews: 180,
        tags: ['văn học', 'việt nam', 'hiện đại']
    },
    {
        id: '5',
        title: 'Kinh Tế Vi Mô',
        author: 'Hoàng Văn E',
        publisher: 'NXB Kinh tế',
        publishYear: 2022,
        isbn: '978-604-78-2345-6',
        category: 'Kinh tế',
        description: 'Giáo trình cơ bản về kinh tế vi mô với nhiều ví dụ thực tế.',
        coverUrl: 'https://picsum.photos/seed/book5/300/400',
        totalCopies: 20,
        availableCopies: 12,
        rating: 4.5,
        reviews: 95,
        tags: ['kinh tế', 'vi mô', 'thị trường']
    },
    {
        id: '6',
        title: 'Hóa Học Đại Cương',
        author: 'Ngô Thị F',
        publisher: 'NXB Khoa học và Kỹ thuật',
        publishYear: 2023,
        isbn: '978-604-12-3456-7',
        category: 'Hóa học',
        description: 'Kiến thức cơ bản về hóa học dành cho sinh viên các ngành khoa học tự nhiên.',
        coverUrl: 'https://picsum.photos/seed/book6/300/400',
        totalCopies: 100,
        availableCopies: 85,
        rating: 4.8,
        reviews: 310,
        tags: ['hóa học', 'đại cương', 'khoa học']
    },
    {
        id: '7',
        title: 'Vật Lý Đại Cương',
        author: 'Đặng Văn G',
        publisher: 'NXB Đại học Quốc gia',
        publishYear: 2022,
        isbn: '978-604-89-4567-8',
        category: 'Vật lý',
        description: 'Giáo trình vật lý đại cương với cách tiếp cận hiện đại và nhiều bài tập thực hành.',
        coverUrl: 'https://picsum.photos/seed/book7/300/400',
        totalCopies: 25,
        availableCopies: 18,
        rating: 4.9,
        reviews: 150,
        tags: ['vật lý', 'đại cương', 'thực hành']
    },
    {
        id: '8',
        title: 'Triết Học Mác-Lênin',
        author: 'Vũ Thị H',
        publisher: 'NXB Chính trị Quốc gia',
        publishYear: 2023,
        isbn: '978-604-34-5678-9',
        category: 'Triết học',
        description: 'Giáo trình triết học Mác-Lênin dành cho sinh viên các trường đại học.',
        coverUrl: 'https://picsum.photos/seed/book8/300/400',
        totalCopies: 60,
        availableCopies: 45,
        rating: 4.7,
        reviews: 220,
        tags: ['triết học', 'mác-lênin', 'chính trị']
    },
]

export const MOCK_USERS: User[] = [
    { id: '1', name: 'Nguyễn Văn An', email: 'anvn@student.vinhuni.edu.vn', studentId: 'SV001', department: 'Khoa học máy tính', role: UserRole.STUDENT },
    { id: '2', name: 'Trần Thị Bình', email: 'binhtt@student.vinhuni.edu.vn', studentId: 'SV002', department: 'Toán học', role: UserRole.STUDENT },
    { id: '3', name: 'PGS.TS Lê Văn Cường', email: 'cuonglv@vinhuni.edu.vn', facultyId: 'GV001', department: 'Khoa học máy tính', role: UserRole.FACULTY },
    { id: '4', name: 'Thủ thư Phạm Thị Dung', email: 'dungpt@vinhuni.edu.vn', department: 'Thư viện', role: UserRole.LIBRARIAN },
    { id: '5', name: 'Admin', email: 'admin@vinhuni.edu.vn', department: 'Quản trị hệ thống', role: UserRole.ADMIN },
]

export const MOCK_BORROW_RECORDS: BorrowRecord[] = [
    {
        id: 'BR001',
        userId: '1',
        bookId: '1',
        borrowDate: '2024-01-15',
        dueDate: '2024-02-15',
        returnDate: '2024-02-10',
        renewCount: 0,
        status: BorrowStatus.RETURNED,
    },
    {
        id: 'BR002',
        userId: '2',
        bookId: '3',
        borrowDate: '2024-01-20',
        dueDate: '2024-02-20',
        renewCount: 1,
        status: BorrowStatus.ACTIVE,
    },
    {
        id: 'BR003',
        userId: '1',
        bookId: '5',
        borrowDate: '2024-01-25',
        dueDate: '2024-02-25',
        renewCount: 0,
        status: BorrowStatus.OVERDUE,
        fine: 50000,
    },
]

export const CATEGORIES = ['Tất cả', 'Khoa học máy tính', 'Toán học', 'Vật lý', 'Hóa học', 'Lịch sử', 'Văn học', 'Kinh tế', 'Triết học']

export const MOCK_LIBRARY_NEWS: LibraryNews[] = [
    {
        id: '1',
        title: 'Thư viện mở rộng bộ sưu tập sách điện tử mới',
        publishedAt: '2024-05-20',
        author: 'Thủ thư Phạm Thị Dung',
        excerpt: 'Thư viện trường đại học đã bổ sung hơn 1000 đầu sách điện tử mới thuộc các lĩnh vực khoa học, công nghệ và xã hội nhân văn.',
        imageUrl: 'https://picsum.photos/seed/library1/400/200',
        category: 'Tin tức thư viện',
        content: `Nhằm phục vụ tốt hơn nhu cầu học tập và nghiên cứu của sinh viên, giảng viên, thư viện trường đại học đã chính thức bổ sung hơn 1000 đầu sách điện tử mới vào bộ sưu tập số. 
    
Các đầu sách mới này bao gồm những tài liệu tham khảo quan trọng trong các lĩnh vực khoa học máy tính, toán học, vật lý, hóa học, và các ngành khoa học xã hội nhân văn. Đặc biệt, thư viện đã mua bản quyền truy cập một số cơ sở dữ liệu học thuật uy tín như IEEE Xplore, SpringerLink, và JSTOR.
    
Sinh viên và giảng viên có thể truy cập bộ sưu tập sách điện tử mới thông qua hệ thống thư viện số với tài khoản cá nhân. Thư viện cũng sẽ tổ chức các buổi hướng dẫn sử dụng vào tuần tới.`
    },
    {
        id: '2',
        title: '5 Phụ kiện không thể thiếu cho Game Thủ chuyên nghiệp',
        publishedAt: '2024-05-18',
        author: 'Admin',
        excerpt: 'Từ bàn phím cơ đến chuột siêu nhẹ, đây là những phụ kiện sẽ giúp bạn thống trị mọi trận đấu.',
        imageUrl: 'https://picsum.photos/seed/news2/400/200',
        category: 'Gaming',
        content: `Để chinh phục thế giới ảo và đạt đến đỉnh cao trong thi đấu, việc sở hữu một cỗ máy mạnh mẽ là chưa đủ. Các phụ kiện phù hợp chính là vũ khí bí mật giúp game thủ tối ưu hóa phản xạ, tăng cường sự thoải mái và khẳng định phong cách riêng. Dưới đây là 5 món phụ kiện mà bất kỳ game thủ chuyên nghiệp nào cũng nên có trong kho vũ khí của mình:

1.  **Bàn phím cơ Ergo-Flow:** Với switch quang học siêu nhạy và thiết kế công thái học, mỗi cú nhấn phím đều chính xác và tức thì.
2.  **Chuột Gaming Stealth:** Siêu nhẹ, DPI tùy chỉnh và thiết kế đối xứng hoàn hảo cho mọi kiểu cầm.
3.  **Tai nghe Acoustic Bliss:** Âm thanh vòm 7.1 và khả năng chống ồn tuyệt đối giúp bạn nghe rõ mọi tiếng bước chân của kẻ địch.
4.  **Lót chuột cỡ lớn:** Bề mặt tối ưu hóa cho tốc độ và khả năng kiểm soát.
5.  **Màn hình 4K PixelPerfect:** Tần số quét cao và độ trễ thấp cho hình ảnh mượt mà, không xé hình.`
    },
    {
        id: '3',
        title: 'Mẹo giữ pin cho smartwatch và các thiết bị đeo tay',
        publishedAt: '2024-05-15',
        author: 'Admin',
        excerpt: 'Tìm hiểu các cách đơn giản để kéo dài thời lượng pin cho các thiết bị công nghệ đeo tay của bạn.',
        imageUrl: 'https://picsum.photos/seed/news3/400/200',
        category: 'Thủ thuật',
        content: `Các thiết bị đeo thông minh như smartwatch đã trở thành một phần không thể thiếu trong cuộc sống hiện đại. Tuy nhiên, thời lượng pin vẫn là một trong những mối quan tâm hàng đầu của người dùng. Để giúp bạn tận dụng tối đa thiết bị của mình, hãy áp dụng những mẹo đơn giản sau:

-   **Tắt các thông báo không cần thiết:** Mỗi thông báo đều làm màn hình sáng lên và tiêu thụ năng lượng.
-   **Giảm độ sáng màn hình:** Đặt độ sáng ở mức vừa đủ nhìn hoặc sử dụng chế độ tự động.
-   **Tắt chế độ Always-On Display** nếu không thực sự cần thiết.
-   **Vô hiệu hóa các kết nối không dây** như Wi-Fi, GPS khi không sử dụng.
-   **Sử dụng mặt đồng hồ đơn giản,** ít màu sắc và hiệu ứng động.`
    },
]

export interface FAQItem {
    question: string
    answer: string
}

export const MOCK_FAQS: FAQItem[] = [
    {
        question: 'Làm thế nào để theo dõi đơn hàng của tôi?',
        answer: 'Bạn có thể theo dõi đơn hàng của mình trong trang "Hồ sơ cá nhân" sau khi đăng nhập. Trạng thái đơn hàng sẽ được cập nhật liên tục từ lúc xử lý đến khi giao hàng thành công.'
    },
    {
        question: 'Chính sách vận chuyển của cửa hàng là gì?',
        answer: 'Chúng tôi cung cấp miễn phí vận chuyển cho tất cả các đơn hàng trên 500.000 VNĐ. Đối với các đơn hàng dưới mức này, phí vận chuyển cố định là 30.000 VNĐ. Thời gian giao hàng dự kiến từ 2-5 ngày làm việc.'
    },
    {
        question: 'Tôi có thể trả lại sản phẩm nếu không hài lòng không?',
        answer: 'Có, chúng tôi có chính sách đổi trả trong vòng 7 ngày kể từ ngày nhận hàng. Sản phẩm phải còn nguyên vẹn, chưa qua sử dụng và đầy đủ bao bì. Vui lòng liên hệ bộ phận hỗ trợ khách hàng để biết thêm chi tiết.'
    },
    {
        question: 'Cửa hàng chấp nhận những phương thức thanh toán nào?',
        answer: 'Hiện tại, chúng tôi chỉ hỗ trợ thanh toán khi nhận hàng (COD) cho mục đích demo. Chúng tôi đang làm việc để tích hợp các cổng thanh toán trực tuyến trong tương lai gần.'
    }
]

export const MOCK_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'Laptop Gaming XYZ',
        description: 'Laptop gaming cao cấp với card đồ họa RTX 4070',
        price: 25000000,
        category: 'Laptop',
        imageUrl: 'https://picsum.photos/seed/product1/300/300',
        rating: 4.5,
        reviews: 120,
        inStock: true,
        stock: 10,
        tags: ['gaming', 'laptop', 'rtx']
    },
    {
        id: '2',
        name: 'Tai nghe Bluetooth ABC',
        description: 'Tai nghe không dây chất lượng cao với thời lượng pin 30 giờ',
        price: 1500000,
        category: 'Tai nghe',
        imageUrl: 'https://picsum.photos/seed/product2/300/300',
        rating: 4.8,
        reviews: 85,
        inStock: true,
        stock: 25,
        tags: ['bluetooth', 'wireless', 'music']
    },
    {
        id: '3',
        name: 'Điện thoại thông minh DEF',
        description: 'Điện thoại flagship với camera 108MP và màn hình AMOLED',
        price: 18000000,
        category: 'Điện thoại',
        imageUrl: 'https://picsum.photos/seed/product3/300/300',
        rating: 4.7,
        reviews: 200,
        inStock: false,
        stock: 0,
        tags: ['smartphone', 'camera', 'amoled']
    }
]