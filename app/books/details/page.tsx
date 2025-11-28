'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react' // Thêm useRef
import 'antd/dist/reset.css'
import { Card, Descriptions, Typography, Row, Col, Tag, Space, Divider, Rate, Button, Image as AntImage, Modal, Form, Input, List, Avatar, message } from 'antd'
import { BookOutlined, CalendarOutlined, FieldNumberOutlined, GlobalOutlined, HomeOutlined, TagsOutlined, DownloadOutlined, EyeOutlined, UserOutlined, StarOutlined, CommentOutlined, LoginOutlined } from '@ant-design/icons'
import { useAuth } from '@/lib/hooks/useAuth'
import { useTheme } from '@/lib/context/ThemeContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { show_books, add_book_review, show_book_reviews, view_count } from '@/app/actions/generalActions'
import { useSearchParams } from 'next/navigation'
import Head from 'next/head'

const { Title, Paragraph, Text } = Typography

const BookDetailsPage: React.FC = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const booksId = searchParams.get('books_id')
    const { theme } = useTheme()

    // --- FIX: Thêm ref để tracking việc gọi API ---
    const loadedBookId = useRef<string | null>(null);

    const [book, setBook] = React.useState<any | null>(null)
    const [error, setError] = React.useState<string | null>(null)
    const [favorites, setFavorites] = React.useState<Set<number>>(new Set())
    const [previewModalVisible, setPreviewModalVisible] = React.useState<boolean>(false)
    const [pdfUrl, setPdfUrl] = React.useState<string>('')
    const [reviews, setReviews] = React.useState<any[]>([])
    const [form] = Form.useForm()
    const [submitting, setSubmitting] = React.useState(false)
    const { user } = useAuth()

    const ViewCount = async (bookId: number | undefined) => {
        if (!bookId) return;
        try {
            view_count({ books_id: bookId });
        } catch (error) {
            console.error('Lỗi không cập nhật được số lượt xem:', error);
        }
    };

    const fetchReviews = async () => {
        if (!booksId) return;
        try {
            const response = await show_book_reviews({ booksId });
            if (response.success) {
                setReviews(response.data);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const { averageRating, reviewCount } = useMemo(() => {
        if (!reviews || reviews.length === 0) {
            return { averageRating: 0, reviewCount: 0 };
        }
        const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
        return {
            averageRating: totalRating / reviews.length,
            reviewCount: reviews.length,
        };
    }, [reviews]);

    // ... (Giữ nguyên phần handleSubmitReview và resolveImageSrc) ...
    const handleSubmitReview = async (values: any) => {
        if (!user) {
            router.push('/login')
            return;
        }
        if (!booksId) {
            Modal.error({ title: 'Lỗi', content: 'Không tìm thấy thông tin sách', okText: 'Đóng' });
            return;
        }
        try {
            setSubmitting(true);
            const reviewData = { books_id: booksId, rating: values.rating, comment: values.comment };
            const response = await add_book_review(reviewData);
            if (response.success) {
                Modal.success({ title: 'Đánh giá thành công', content: 'Cảm ơn bạn đã đánh giá cuốn sách này!', okText: 'Đóng' });
                form.resetFields();
                fetchReviews();
            } else {
                Modal.error({ title: 'Lỗi', content: response.message || 'Có lỗi xảy ra khi gửi đánh giá', okText: 'Đóng' });
            }
        } catch (error) {
            Modal.error({ title: 'Lỗi', content: 'Có lỗi xảy ra khi gửi đánh giá', okText: 'Đóng' });
        } finally {
            setSubmitting(false);
        }
    };

    const resolveImageSrc = useMemo(() => (b: any): string => {
        if (!b) return '/logo/logo.svg'
        const raw = (b.coverUrl as string) || (b.image as string) || '/logo/logo.svg'
        if (!raw || typeof raw !== 'string') return '/logo/logo.svg'
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
        if (raw.startsWith('data:')) return raw
        if (raw.startsWith('/')) return raw
        return `/api/get_file?file=${raw}`
    }, [])

    // --- FIX: Sửa lại useEffect để chặn gọi 2 lần ---
    React.useEffect(() => {
        // Nếu không có booksId, thoát
        if (!booksId) return;

        // Kiểm tra xem ID này đã được load chưa. 
        // Nếu booksId hiện tại GIỐNG ID đã lưu trong ref -> return (chặn gọi API lần 2)
        if (loadedBookId.current === booksId) return;

        // Nếu chưa load, cập nhật ref thành ID hiện tại để đánh dấu
        loadedBookId.current = booksId;

        // Bắt đầu gọi API
        fetchReviews();

        // Gọi hàm ViewCount (bạn định nghĩa ở trên nhưng chưa dùng, tôi thêm vào đây luôn nếu cần)
        // ViewCount(Number(booksId)); 

        const load = async () => {
            try {
                setError(null)
                const res = await show_books()
                if (res && res.success && Array.isArray(res.data)) {
                    const found = res.data.find((b: any) => String(b.books_id ?? b.id) === String(booksId))
                    setBook(found || null)
                    if (!found) setError('Không tìm thấy sách')

                    // Gọi ViewCount sau khi tìm thấy sách (nếu muốn đếm view khi load trang thành công)
                    if (found) {
                        ViewCount(found.books_id ?? found.id);
                    }
                } else {
                    setError(res?.message || 'Không thể tải dữ liệu sách')
                }
            } catch (e: any) {
                setError(e?.message || 'Lỗi tải dữ liệu')
            }
        }
        load()

    }, [booksId]) // Dependency giữ nguyên

    // ... (Phần còn lại của component giữ nguyên) ...
    const [isClient, setIsClient] = React.useState(false)

    React.useEffect(() => {
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
            if (next.has(num)) next.delete(num)
            else next.add(num)
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

    const description = useMemo(() => {
        if (!book) return ''
        return book.Description || book.description || 'Chưa có mô tả cho tài liệu này.'
    }, [book])

    const author = useMemo(() => {
        if (!book) return 'Chưa cập nhật'
        return book.Author || book.author || book.AUTHOR || 'Chưa cập nhật'
    }, [book])

    // Return JSX... (Phần render giữ nguyên như file gốc của bạn)
    return (
        <div style={{
            padding: '16px 12px',
            maxWidth: 1400,
            margin: '0 auto',
            zoom: 1,
            WebkitTransform: 'scale(1)',
            transform: 'scale(1)',
        }}>
            {/* ... Nội dung render giống hệt file cũ ... */}
            {/* Để code gọn tôi không copy lại toàn bộ JSX vì không có thay đổi ở phần giao diện */}
            {book && (
                <Head>
                    <title>{`${book.Title || book.title} | Chi tiết sách`}</title>
                    <meta name="description" content={description.slice(0, 160)} />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                    <link rel="canonical" href={process.env.NEXT_PUBLIC_BASE_URL + `/books/details?books_id=${booksId}`} />
                    <meta property="og:type" content="article" />
                    <meta property="og:title" content={book.Title || book.title} />
                    <meta property="og:description" content={description.slice(0, 200)} />
                    <meta property="og:image" content={resolveImageSrc(book)} />
                    <meta property="og:url" content={process.env.NEXT_PUBLIC_BASE_URL + `/books/details?books_id=${booksId}`} />
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:title" content={book.Title || book.title} />
                    <meta name="twitter:description" content={description.slice(0, 200)} />
                    <meta name="twitter:image" content={resolveImageSrc(book)} />
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                '@context': 'https://schema.org',
                                '@type': 'Book',
                                name: book.Title || book.title,
                                author: author !== 'Chưa cập nhật' ? author : undefined,
                                isbn: book.ISBN || book.isbn || undefined,
                                inLanguage: book.Language || book.language || undefined,
                                datePublished: book.PublishYear || book.publishYear || undefined,
                                image: resolveImageSrc(book),
                                description: description,
                                publisher: book.Publisher || book.publisher || undefined,
                                url: isClient ? window.location.href : '',
                            }),
                        }}
                    />
                </Head>
            )}

            {!booksId && (
                <Card style={{ marginBottom: 16 }}>
                    <Text type="danger">Thiếu tham số books_id</Text>
                </Card>
            )}

            {error && (
                <Card style={{ marginBottom: 16 }}>
                    <Text type="danger">{error}</Text>
                </Card>
            )}

            {!book ? (
                <Card>Đang tải chi tiết sách...</Card>
            ) : (
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={9} lg={9}>
                        <Card
                            hoverable
                            cover={
                                <div style={{ padding: 12, background: '#f0f2f5' }}>
                                    <AntImage
                                        alt={book.Title || book.title}
                                        src={resolveImageSrc(book)}
                                        width="100%"
                                        height={240}
                                        style={{ objectFit: 'contain', borderRadius: 8, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
                                        preview={true}
                                        placeholder={
                                            <div style={{ background: '#f5f5f5', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <BookOutlined style={{ fontSize: 24, color: '#bfbfbf' }} />
                                            </div>
                                        }
                                    />
                                </div>
                            }
                            styles={{ body: { padding: '12px' } }}
                        >
                            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                <div>
                                    <Text strong style={{ fontSize: 16, marginBottom: 8, display: 'block' }}>Đánh giá</Text>
                                    <Space align="center" style={{ width: '100%', justifyContent: 'center' }}>
                                        <Rate allowHalf value={averageRating} disabled style={{ fontSize: 16 }} />
                                        <Text type="secondary">({reviewCount} đánh giá)</Text>
                                    </Space>
                                </div>

                                {tags.length > 0 && (
                                    <>
                                        <Divider style={{ margin: '12px 0' }} />
                                        <div>
                                            <Text strong style={{ marginBottom: 8, display: 'block' }}>Thẻ tag</Text>
                                            <Space wrap style={{ justifyContent: 'center' }}>
                                                {tags.map((tag) => (
                                                    <Tag key={tag} icon={<TagsOutlined />} color="blue" style={{ margin: '4px', padding: '4px 8px' }}>{tag}</Tag>
                                                ))}
                                            </Space>
                                        </div>
                                    </>
                                )}
                            </Space>
                        </Card>
                    </Col>

                    <Col xs={24} md={15} lg={15}>
                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                            <Card>
                                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                                    <div style={{ textAlign: 'left' }}>
                                        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>{book.Title || book.title}</Title>
                                        <Text type="secondary" style={{ fontSize: 16, marginTop: 8, display: 'block' }}>{book.DocumentType || book.documentType}</Text>
                                    </div>
                                    <Divider style={{ margin: '16px 0' }} />
                                    <Descriptions column={1} bordered size="default" labelStyle={{ fontWeight: 500, width: '180px', padding: '16px 24px' }} contentStyle={{ padding: '16px 24px' }}>
                                        <Descriptions.Item label={<Space><BookOutlined />Tác giả</Space>} labelStyle={{ color: '#1890ff' }}><Text strong style={{ fontSize: 16 }}>{author}</Text></Descriptions.Item>
                                        <Descriptions.Item label={<Space><HomeOutlined />Nhà xuất bản</Space>} labelStyle={{ color: '#1890ff' }}><Text>{book.Publisher || book.publisher || 'Chưa cập nhật'}</Text></Descriptions.Item>
                                        <Descriptions.Item label={<Space><CalendarOutlined />Năm xuất bản</Space>} labelStyle={{ color: '#1890ff' }}><Text>{book.PublishYear || book.publishYear || 'Chưa cập nhật'}</Text></Descriptions.Item>
                                        <Descriptions.Item label={<Space><GlobalOutlined />Ngôn ngữ</Space>} labelStyle={{ color: '#1890ff' }}><Text>{book.Language || book.Language || 'Chưa cập nhật'}</Text></Descriptions.Item>
                                    </Descriptions>
                                </Space>
                            </Card>

                            <Card>
                                <Title level={4} style={{ color: '#1890ff', marginBottom: 16 }}>Giới thiệu sách</Title>
                                <Paragraph style={{ textAlign: 'justify', lineHeight: 2, fontSize: '16px', margin: 0 }} ellipsis={{ rows: 3, expandable: true, symbol: 'Xem thêm' }}>{description}</Paragraph>
                            </Card>

                            <Card>
                                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                                    <Button onClick={() => toggleFav(book.books_id ?? book.id)} icon={<TagsOutlined />} style={{ height: '40px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, padding: '4px 16px' }}>{isFav(book.books_id ?? book.id) ? 'Đã thích' : 'Yêu thích'}</Button>
                                    <Button type="primary" icon={<EyeOutlined />} onClick={() => {
                                        const pdfUrl = `/api/get_file?file=${book.file}`;
                                        fetch(pdfUrl).then(response => {
                                            if (response.ok) { setPdfUrl(pdfUrl); setPreviewModalVisible(true); } else { throw new Error('PDF không tồn tại'); }
                                        }).catch(() => { Modal.error({ title: 'Lỗi', content: 'Không thể xem trước sách này. File PDF không tồn tại.' }); });
                                    }} style={{ height: '40px', flex: 1, margin: '0 4px', backgroundColor: '#52c41a' }}>Đọc Ngay</Button>
                                    <Button icon={<DownloadOutlined />} onClick={() => {
                                        const pdfUrl = `/api/get_file?file=${book.file}`;
                                        fetch(pdfUrl).then(response => {
                                            if (response.ok) { return response.blob(); } throw new Error('PDF không tồn tại');
                                        }).then(blob => {
                                            const url = window.URL.createObjectURL(blob);
                                            const link = document.createElement('a');
                                            link.href = url; link.download = `${book.Title || 'book'}.pdf`;
                                            document.body.appendChild(link); link.click();
                                            window.URL.revokeObjectURL(url); document.body.removeChild(link);
                                        }).catch(() => { Modal.error({ title: 'Lỗi', content: 'Không thể tải xuống sách này. File PDF không tồn tại.' }); });
                                    }} style={{ height: '40px', flex: 1, margin: '0 4px' }}>Tải về</Button>
                                </div>
                            </Card>

                            <Modal title={<Space><EyeOutlined /> Xem trước sách - {book.Title}</Space>} open={previewModalVisible} onCancel={() => setPreviewModalVisible(false)} footer={null} width="80%" style={{ top: 20 }} styles={{ body: { height: 'calc(90vh - 110px)', padding: 0 } }}>
                                {pdfUrl ? (
                                    <object data={`${pdfUrl}#toolbar=0`} type="application/pdf" width="100%" height="100%" style={{ border: 'none' }}>
                                        <div style={{ padding: 24, textAlign: 'center' }}>
                                            <p>Trình duyệt của bạn không hỗ trợ xem PDF trực tiếp.</p>
                                            <Button type="primary" icon={<DownloadOutlined />} onClick={() => window.open(pdfUrl, '_blank')}>Mở PDF trong tab mới</Button>
                                        </div>
                                    </object>
                                ) : (
                                    <div style={{ padding: 24, textAlign: 'center' }}><p>Không thể tải file PDF. Vui lòng thử lại sau.</p></div>
                                )}
                            </Modal>

                            <Card>
                                <Title level={4} style={{ color: '#1890ff', marginBottom: 16 }}><StarOutlined /> Đánh giá sách</Title>
                                <Card bordered={false} style={{ marginBottom: 24, borderRadius: '8px' }}>
                                    {user ? (
                                        <Form form={form} onFinish={handleSubmitReview} layout="vertical">
                                            <Form.Item name="rating" rules={[{ required: true, message: 'Vui lòng cho điểm đánh giá!' }]}><Rate allowHalf style={{ fontSize: '24px', marginBottom: '12px' }} /></Form.Item>
                                            <Form.Item name="comment" rules={[{ required: true, message: 'Vui lòng nhập nhận xét!' }]}><Input.TextArea rows={4} placeholder="Chia sẻ cảm nghĩ của bạn về cuốn sách này..." /></Form.Item>
                                            <Form.Item><Button type="primary" htmlType="submit" loading={submitting} icon={<CommentOutlined />}>Gửi đánh giá</Button></Form.Item>
                                        </Form>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '24px' }}>
                                            <Space direction="vertical" size="middle" align="center">
                                                <Text>Bạn cần đăng nhập để đánh giá sách</Text>
                                                <Button type="primary" icon={<LoginOutlined />} onClick={() => router.push('/login')}>Đăng nhập ngay</Button>
                                            </Space>
                                        </div>
                                    )}
                                </Card>

                                <List itemLayout="horizontal" dataSource={reviews} style={{ padding: '16px', borderRadius: '8px' }}
                                    locale={{ emptyText: (<div style={{ textAlign: 'center', padding: '32px 0', borderRadius: '8px' }}><StarOutlined style={{ fontSize: 32 }} /><p style={{ marginTop: 12, fontSize: '16px' }}>Chưa có đánh giá nào cho cuốn sách này</p></div>) }}
                                    renderItem={(review: any) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff', color: '#ffffff' }} />}
                                                title={<Space align="center"><span style={{ fontWeight: 500 }}>{review.username || 'Ẩn danh'}</span><Rate disabled defaultValue={review.rating} style={{ fontSize: '16px' }} /></Space>}
                                                description={<div style={{ padding: '12px', borderRadius: '8px', marginTop: '8px' }}><p style={{ margin: '0 0 8px 0', lineHeight: '1.6' }}>{review.comment}</p><Text style={{ fontSize: '12px' }}>{isClient ? new Date(review.review_date).toLocaleDateString('vi-VN') : ''}</Text></div>}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </Space>
                    </Col>
                </Row>
            )}
        </div>
    )
}

export default BookDetailsPage