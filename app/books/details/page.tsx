'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import 'antd/dist/reset.css'
import { Card, Typography, Row, Col, Tag, Space, Divider, Rate, Button, Modal, Form, Input, List, Avatar, Tabs, Skeleton, message, Tooltip } from 'antd'
import { BookOutlined, CalendarOutlined, GlobalOutlined, HomeOutlined, TagsOutlined, DownloadOutlined, ReadOutlined, HeartOutlined, HeartFilled, SendOutlined, UserOutlined, FileTextOutlined, MessageOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { useAuth } from '@/lib/hooks/useAuth'
import { useTheme } from '@/lib/context/ThemeContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { show_books, add_book_review, show_book_reviews, view_count } from '@/app/actions/generalActions'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

const { Title, Paragraph, Text } = Typography

// --- STYLE CONFIGURATION ---
const cardStyle: React.CSSProperties = {
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
    border: 'none',
    overflow: 'hidden',
    marginBottom: '24px',
    background: '#fff'
};

const BookDetailsPage: React.FC = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const booksId = searchParams.get('books_id')
    const { theme } = useTheme()

    const loadedBookId = useRef<string | null>(null);

    const [book, setBook] = useState<any | null>(null)
    const [relatedBooks, setRelatedBooks] = useState<any[]>([]) // State cho sách liên quan
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [favorites, setFavorites] = useState<Set<number>>(new Set())
    const [previewModalVisible, setPreviewModalVisible] = useState<boolean>(false)
    const [pdfUrl, setPdfUrl] = useState<string>('')
    const [reviews, setReviews] = useState<any[]>([])
    const [form] = Form.useForm()
    const [submitting, setSubmitting] = useState(false)
    const { user } = useAuth()
    const [isClient, setIsClient] = useState(false)

    // --- LOGIC ---
    const ViewCount = async (bookId: number | undefined) => {
        if (!bookId) return;
        try { view_count({ books_id: bookId }); } catch (error) { console.error('View count error:', error); }
    };

    const fetchReviews = async () => {
        if (!booksId) return;
        try {
            const response = await show_book_reviews({ booksId });
            if (response.success) setReviews(response.data);
        } catch (error) { console.error('Error fetching reviews:', error); }
    };

    const { averageRating, reviewCount } = useMemo(() => {
        if (!reviews || reviews.length === 0) return { averageRating: 0, reviewCount: 0 };
        const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
        return { averageRating: totalRating / reviews.length, reviewCount: reviews.length };
    }, [reviews]);

    const handleSubmitReview = async (values: any) => {
        if (!user) { router.push('/login'); return; }
        if (!booksId) return;
        try {
            setSubmitting(true);
            const reviewData = { books_id: booksId, rating: values.rating, comment: values.comment };
            const response = await add_book_review(reviewData);
            if (response.success) {
                message.success('Cảm ơn bạn đã đánh giá cuốn sách này!');
                form.resetFields();
                fetchReviews();
            } else {
                message.error(response.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra khi gửi đánh giá');
        } finally {
            setSubmitting(false);
        }
    };

    const resolveImageSrc = useMemo(() => (b: any): string => {
        if (!b) return '/logo/logo.svg'
        const raw = (b.coverUrl as string) || (b.image as string) || '/logo/logo.svg'
        if (!raw || typeof raw !== 'string') return '/logo/logo.svg'
        if (raw.startsWith('http') || raw.startsWith('data:') || raw.startsWith('/')) return raw
        return `/api/get_file?file=${raw}`
    }, [])

    useEffect(() => {
        if (!booksId) return;
        // Reset lại scroll lên đầu trang khi chuyển sách
        window.scrollTo(0, 0);
        
        if (loadedBookId.current === booksId) return;
        loadedBookId.current = booksId;

        fetchReviews();

        const load = async () => {
            try {
                setLoading(true);
                setError(null)
                const res = await show_books()
                if (res && res.success && Array.isArray(res.data)) {
                    const currentIdStr = String(booksId);
                    const found = res.data.find((b: any) => String(b.books_id ?? b.id) === currentIdStr)
                    
                    setBook(found || null)
                    
                    if (!found) {
                        setError('Không tìm thấy sách')
                    } else {
                        ViewCount(found.books_id ?? found.id);
                        
                        // --- LOGIC TÌM SÁCH LIÊN QUAN ---
                        // Lọc các sách cùng Tác giả hoặc cùng Thể loại (DocumentType)
                        // Và loại trừ sách hiện tại
                        const currentAuthor = found.Author || found.author;
                        const currentType = found.DocumentType || found.documentType;
                        
                        const related = res.data.filter((b: any) => {
                            const bId = String(b.books_id ?? b.id);
                            if (bId === currentIdStr) return false; // Bỏ qua sách đang xem

                            const bAuthor = b.Author || b.author;
                            const bType = b.DocumentType || b.documentType;

                            // Điều kiện: Cùng tác giả HOẶC cùng thể loại
                            return (bAuthor && bAuthor === currentAuthor) || (bType && bType === currentType);
                        });

                        // Lấy tối đa 5 cuốn ngẫu nhiên hoặc đầu tiên
                        setRelatedBooks(related.slice(0, 5));
                    }
                } else {
                    setError(res?.message || 'Không thể tải dữ liệu sách')
                }
            } catch (e: any) {
                setError(e?.message || 'Lỗi tải dữ liệu')
            } finally {
                setLoading(false);
            }
        }
        load()
    }, [booksId]) // Dependency thay đổi khi user click vào sách liên quan

    useEffect(() => {
        setIsClient(true)
        try {
            const raw = localStorage.getItem('favoriteBooks')
            if (raw) setFavorites(new Set(JSON.parse(raw)))
        } catch { }
    }, [])

    const isFav = (id: number | string | undefined) => {
        if (!id) return false
        const num = Number(id)
        return favorites.has(num)
    }

    const toggleFav = (id: number | string | undefined) => {
        if (!id) return
        const num = Number(id)
        setFavorites(prev => {
            const next = new Set(prev)
            if (next.has(num)) {
                next.delete(num)
                message.info('Đã xóa khỏi danh sách yêu thích')
            } else {
                next.add(num)
                message.success('Đã thêm vào danh sách yêu thích')
            }
            try { localStorage.setItem('favoriteBooks', JSON.stringify(Array.from(next))) } catch { }
            return next
        })
    }

    const tags: string[] = useMemo(() => {
        if (!book) return []
        if (Array.isArray(book.tags)) return book.tags
        if (Array.isArray(book.Tags)) return book.Tags
        return []
    }, [book])

    const description = book?.Description || book?.description || 'Chưa có mô tả cho tài liệu này.'
    const author = book?.Author || book?.author || book?.AUTHOR || 'Chưa cập nhật'
    const imageUrl = book ? resolveImageSrc(book) : '/logo/logo.svg'

    // --- RENDER CONTENT ---
    if (!booksId) return <div style={{ padding: 40, textAlign: 'center' }}><Text type="danger">Thiếu tham số books_id</Text></div>
    if (error) return <div style={{ padding: 40, textAlign: 'center' }}><Text type="danger">{error}</Text></div>
    if (loading) return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
            <Skeleton active avatar paragraph={{ rows: 4 }} />
        </div>
    )

    return (
        <div style={{
            background: '#f8f9fa',
            minHeight: '100vh',
            paddingBottom: '40px'
        }}>
            {book && (
                <Head>
                    <title>{`${book.Title || book.title} | Thư viện`}</title>
                    <meta name="description" content={description.slice(0, 160)} />
                </Head>
            )}

            {/* HEADER BACKGROUND ACCENT */}
            <div style={{ height: '240px', background: 'linear-gradient(180deg, #e6f7ff 0%, #f8f9fa 100%)', marginBottom: '-180px' }} />

            <div style={{
                maxWidth: 1200,
                margin: '0 auto',
                padding: '0 16px',
                position: 'relative',
                zIndex: 1
            }}>
                <Row gutter={[32, 32]}>
                    {/* LEFT COLUMN: COVER IMAGE */}
                    <Col xs={24} md={8} lg={7}>
                        <div style={{ position: 'sticky', top: 24 }}>
                            {/* Card hiệu ứng chiều sâu cho ảnh */}
                            <div style={{
                                position: 'relative',
                                borderRadius: '12px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                                background: '#fff',
                                padding: '12px',
                                textAlign: 'center'
                            }}>
                                {/* Layer làm mờ phía sau */}
                                <div style={{
                                    position: 'absolute',
                                    top: 20, left: 20, right: 20, bottom: -10,
                                    backgroundImage: `url(${imageUrl})`,
                                    backgroundSize: 'cover',
                                    filter: 'blur(25px)',
                                    opacity: 0.4,
                                    zIndex: 0,
                                    borderRadius: '50%'
                                }} />

                                {/* Ảnh chính */}
                                <div style={{ position: 'relative', zIndex: 1, width: '100%', aspectRatio: '2/3', borderRadius: '8px', overflow: 'hidden' }}>
                                    <Image
                                        src={imageUrl}
                                        alt={book.Title || book.title}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        sizes="(max-width: 768px) 100vw, 300px"
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Actions Buttons Group */}
                            <Space direction="vertical" style={{ width: '100%', marginTop: 24 }} size={12}>
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<ReadOutlined />}
                                    block
                                    shape="round"
                                    style={{ height: '48px', fontSize: '16px', fontWeight: 600, boxShadow: '0 4px 12px rgba(24, 144, 255, 0.4)' }}
                                    onClick={() => {
                                        const url = `/api/get_file?file=${book.file}`;
                                        setPdfUrl(url);
                                        setPreviewModalVisible(true);
                                    }}
                                >
                                    Đọc ngay
                                </Button>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    {/* <Button
                                        block
                                        size="large"
                                        shape="round"
                                        icon={isFav(book.books_id ?? book.id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                                        onClick={() => toggleFav(book.books_id ?? book.id)}
                                        style={{
                                            borderColor: isFav(book.books_id ?? book.id) ? '#ff4d4f' : undefined,
                                            color: isFav(book.books_id ?? book.id) ? '#ff4d4f' : undefined
                                        }}
                                    >
                                        {isFav(book.books_id ?? book.id) ? 'Đã thích' : 'Yêu thích'}
                                    </Button> */}
                                    <Button
                                        block
                                        size="large"
                                        shape="round"
                                        icon={<DownloadOutlined />}
                                        onClick={() => {
                                            const url = `/api/get_file?file=${book.file}`;
                                            const link = document.createElement('a');
                                            link.href = url;
                                            link.download = `${book.Title || 'book'}.pdf`;
                                            document.body.appendChild(link); link.click(); document.body.removeChild(link);
                                        }}
                                    >
                                        Tải về
                                    </Button>
                                </div>
                            </Space>
                        </div>
                    </Col>

                    {/* RIGHT COLUMN: CONTENT */}
                    <Col xs={24} md={16} lg={17}>
                        {/* Title & Header */}
                        <div style={{ marginBottom: 32 }}>
                            <Space align="center" style={{ marginBottom: 8 }}>
                                <Tag color="blue" bordered={false} style={{ borderRadius: 12, padding: '2px 10px' }}>{book.DocumentType || book.documentType || 'Tài liệu'}</Tag>
                                <Space>
                                    <Rate allowHalf value={averageRating} disabled style={{ fontSize: 14, color: '#faad14' }} />
                                    <Text type="secondary" style={{ fontSize: 13 }}>({reviewCount} đánh giá)</Text>
                                </Space>
                            </Space>

                            <Title level={1} style={{ margin: '8px 0', fontSize: '2.4rem', fontWeight: 700, color: '#1f1f1f', lineHeight: 1.2 }}>
                                {book.Title || book.title}
                            </Title>
                            <Text style={{ fontSize: '1.1rem', color: '#595959' }}>
                                Tác giả: <Text strong style={{ color: '#1890ff' }}>{author}</Text>
                            </Text>

                            {/* Tags */}
                            {tags.length > 0 && (
                                <div style={{ marginTop: 16 }}>
                                    {tags.map((tag) => (
                                        <Tag key={tag} icon={<TagsOutlined />} style={{ borderRadius: 12, background: 'rgba(0,0,0,0.03)', border: 'none', padding: '4px 12px', fontSize: 13 }}>
                                            {tag}
                                        </Tag>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Tabs Navigation for Content */}
                        <Card style={cardStyle} bodyStyle={{ padding: '0' }}>
                            <Tabs
                                defaultActiveKey="1"
                                size="large"
                                tabBarStyle={{ padding: '0 24px', margin: 0 }}
                                items={[
                                    {
                                        key: '1',
                                        label: <span style={{ fontSize: 16, fontWeight: 500 }}><FileTextOutlined /> Giới thiệu</span>,
                                        children: (
                                            <div style={{ padding: '32px' }}>
                                                <Paragraph style={{ fontSize: 16, lineHeight: 1.8, color: '#434343', textAlign: 'justify' }} ellipsis={{ rows: 5, expandable: true, symbol: 'Đọc thêm' }}>
                                                    {description}
                                                </Paragraph>
                                                <Divider />
                                                <Row gutter={[24, 24]}>
                                                    <Col span={12}>
                                                        <Space direction="vertical" size={4}>
                                                            <Text type="secondary" style={{ fontSize: 12 }}>NHÀ XUẤT BẢN</Text>
                                                            <Text strong style={{ fontSize: 16 }}><HomeOutlined /> {book.Publisher || book.publisher || 'N/A'}</Text>
                                                        </Space>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Space direction="vertical" size={4}>
                                                            <Text type="secondary" style={{ fontSize: 12 }}>NĂM XUẤT BẢN</Text>
                                                            <Text strong style={{ fontSize: 16 }}><CalendarOutlined /> {book.PublishYear || book.publishYear || 'N/A'}</Text>
                                                        </Space>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Space direction="vertical" size={4}>
                                                            <Text type="secondary" style={{ fontSize: 12 }}>NGÔN NGỮ</Text>
                                                            <Text strong style={{ fontSize: 16 }}><GlobalOutlined /> {book.Language || book.language || 'N/A'}</Text>
                                                        </Space>
                                                    </Col>
                                                </Row>
                                            </div>
                                        )
                                    },
                                    {
                                        key: '2',
                                        label: <span style={{ fontSize: 16, fontWeight: 500 }}><MessageOutlined /> Đánh giá ({reviews.length})</span>,
                                        children: (
                                            <div style={{ padding: '32px' }}>
                                                {/* Review Form */}
                                                <div style={{ marginBottom: 40, background: '#f9f9f9', padding: 24, borderRadius: 12 }}>
                                                    {user ? (
                                                        <Form form={form} onFinish={handleSubmitReview} layout="vertical">
                                                            <Text strong style={{ fontSize: 16 }}>Viết đánh giá của bạn</Text>
                                                            <Form.Item name="rating" style={{ marginBottom: 12 }}>
                                                                <Rate style={{ fontSize: 24, color: '#faad14' }} />
                                                            </Form.Item>
                                                            <Form.Item name="comment" rules={[{ required: true, message: 'Nhập nội dung...' }]}>
                                                                <Input.TextArea
                                                                    rows={3}
                                                                    placeholder="Cuốn sách này như thế nào? Chia sẻ suy nghĩ của bạn..."
                                                                    style={{ borderRadius: 8, border: '1px solid #d9d9d9' }}
                                                                />
                                                            </Form.Item>
                                                            <Form.Item style={{ marginBottom: 0 }}>
                                                                <Button type="primary" htmlType="submit" loading={submitting} icon={<SendOutlined />} shape="round">
                                                                    Gửi đánh giá
                                                                </Button>
                                                            </Form.Item>
                                                        </Form>
                                                    ) : (
                                                        <div style={{ textAlign: 'center' }}>
                                                            <Text type="secondary">Vui lòng <a onClick={() => router.push('/login')}>đăng nhập</a> để viết đánh giá.</Text>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Reviews List */}
                                                <List
                                                    itemLayout="vertical"
                                                    dataSource={reviews}
                                                    locale={{ emptyText: <div style={{ textAlign: 'center', padding: 20 }}>Chưa có đánh giá nào.</div> }}
                                                    renderItem={(item) => (
                                                        <List.Item style={{ padding: '20px 0', borderBottom: '1px solid #f0f0f0' }}>
                                                            <List.Item.Meta
                                                                avatar={<Avatar style={{ backgroundColor: '#fde3cf', color: '#f56a00', verticalAlign: 'middle' }} size="large" icon={<UserOutlined />} />}
                                                                title={
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                        <Text strong style={{ fontSize: 16 }}>{item.username || 'Người dùng ẩn danh'}</Text>
                                                                        <Rate disabled value={item.rating} style={{ fontSize: 12 }} />
                                                                    </div>
                                                                }
                                                                description={<Text type="secondary" style={{ fontSize: 12 }}>{isClient && item.review_date ? new Date(item.review_date).toLocaleDateString('vi-VN') : ''}</Text>}
                                                            />
                                                            <div style={{ marginLeft: 56, color: '#434343', fontSize: 15 }}>
                                                                {item.comment}
                                                            </div>
                                                        </List.Item>
                                                    )}
                                                />
                                            </div>
                                        )
                                    }
                                ]}
                            />
                        </Card>
                    </Col>
                </Row>
                
                {/* --- RELATED BOOKS SECTION --- */}
                {relatedBooks.length > 0 && (
                    <div style={{ marginTop: 40, marginBottom: 40 }}>
                         <Divider orientation="left" style={{ borderColor: '#e8e8e8' }}>
                            <Title level={3} style={{ margin: 0, fontWeight: 600 }}>
                                <ReadOutlined style={{ marginRight: 8, color: '#1890ff' }} /> 
                                Có thể bạn sẽ thích
                            </Title>
                        </Divider>

                        <List
                            grid={{ gutter: 24, xs: 2, sm: 3, md: 4, lg: 5, xl: 5, xxl: 5 }}
                            dataSource={relatedBooks}
                            renderItem={(item) => (
                                <List.Item>
                                    <Link href={`/books/details?books_id=${item.books_id ?? item.id}`} style={{ textDecoration: 'none' }}>
                                        <Card
                                            hoverable
                                            style={{ borderRadius: 12, overflow: 'hidden', height: '100%', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                            bodyStyle={{ padding: 12 }}
                                            cover={
                                                <div style={{ position: 'relative', width: '100%', aspectRatio: '2/3', background: '#f5f5f5' }}>
                                                    <Image
                                                        src={resolveImageSrc(item)}
                                                        alt={item.Title || item.title}
                                                        fill
                                                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                </div>
                                            }
                                        >
                                            <Tooltip title={item.Title || item.title}>
                                                <Text strong style={{ fontSize: 14, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>
                                                    {item.Title || item.title}
                                                </Text>
                                            </Tooltip>
                                            <Text type="secondary" style={{ fontSize: 12, display: 'block' }} ellipsis>
                                                {item.Author || item.author || 'Đang cập nhật'}
                                            </Text>
                                            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Tag color="blue" style={{ fontSize: 10, margin: 0, border: 'none', background: 'rgba(24, 144, 255, 0.1)', color: '#1890ff' }}>
                                                    {item.DocumentType || item.documentType || 'Sách'}
                                                </Tag>
                                                {/* <Button type="text" size="small" icon={<ArrowRightOutlined />} style={{ color: '#bfbfbf' }} /> */}
                                            </div>
                                        </Card>
                                    </Link>
                                </List.Item>
                            )}
                        />
                    </div>
                )}
            </div>

            {/* PDF PREVIEW MODAL */}
            <Modal
                title={null}
                open={previewModalVisible}
                onCancel={() => setPreviewModalVisible(false)}
                footer={null}
                width="90%"
                style={{ top: 20 }}
                styles={{ body: { height: '85vh', padding: 0, overflow: 'hidden', borderRadius: 12 }, content: { borderRadius: 12, overflow: 'hidden' } }}
                closable={false}
                centered
            >
                <div style={{ height: '50px', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', color: '#fff' }}>
                    <Text style={{ color: '#fff', fontWeight: 500 }} ellipsis>{book?.Title}</Text>
                    <Button type="text" onClick={() => setPreviewModalVisible(false)} style={{ color: '#fff' }}>Đóng</Button>
                </div>
                {pdfUrl ? (
                    <object data={`${pdfUrl}#toolbar=0`} type="application/pdf" width="100%" height="100%" style={{ border: 'none', height: 'calc(85vh - 50px)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 16 }}>
                            <p>Trình duyệt không hỗ trợ xem trực tiếp.</p>
                            <Button type="primary" onClick={() => window.open(pdfUrl, '_blank')}>Mở trong tab mới</Button>
                        </div>
                    </object>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Text>Đang tải tài liệu...</Text>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default BookDetailsPage