'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { 
    Layout, Card, Row, Col, Typography, Form, Input, Button, 
    Avatar, Tabs, Statistic, Divider, Tag, message, Skeleton, Space, Modal 
} from 'antd'
import { 
    UserOutlined, MailOutlined, PhoneOutlined, 
    SafetyCertificateOutlined, HistoryOutlined, 
    EditOutlined, CameraOutlined, ReadOutlined, FieldTimeOutlined,
    BookOutlined, LockOutlined, KeyOutlined, CheckCircleOutlined
} from '@ant-design/icons'
import { getAuthCookie } from '@/app/actions/authActions'
import { change_password } from '@/app/sever/route'
const { Title, Text, Paragraph } = Typography

interface UserInfo {
    id?: number | string;
    name?: string;
    username?: string;
    email?: string;
    role?: number;
    phone?: string;
    address?: string;
    avatar?: string;
    iat?: number;
    exp?: number;
}

export default function ProfilePage() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    
    // --- STATE CHO MODAL ĐỔI MẬT KHẨU ---
    const [isPassModalOpen, setIsPassModalOpen] = useState(false);
    const [passLoading, setPassLoading] = useState(false);
    
    const [form] = Form.useForm();
    const [passForm] = Form.useForm();

    // --- LOGIC: CHECK USER & DECODE TOKEN ---
    useEffect(() => {
        const checkUser = async () => {
            try {
                const token = await getAuthCookie();
                
                if (!token) {
                    setUserInfo(null);
                    setLoading(false);
                    return;
                }

                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const payload = JSON.parse(jsonPayload);

                setUserInfo({
                    id: payload.id || payload.sub,
                    name: payload.username || payload.name,
                    email: payload.email,
                    role: payload.role,
                    phone: payload.phone,
                    address: payload.address,
                    avatar: payload.avatar || payload.image
                });

                form.setFieldsValue({
                    username: payload.username || payload.name,
                    email: payload.email,
                    studentId: payload.id || 'SV---',
                    phone: payload.phone || '',
                    address: payload.address || ''
                });

            } catch (error) {
                console.error("Error checking user:", error);
                setUserInfo(null);
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, [form]);

    const handleUpdate = (values: any) => {
        message.loading({ content: 'Đang cập nhật hồ sơ...', key: 'update' });
        setTimeout(() => {
            message.success({ content: 'Cập nhật thông tin thành công!', key: 'update' });
        }, 1500);
    };

    // --- LOGIC GỌI API ĐỔI MẬT KHẨU (ĐÃ CẬP NHẬT) ---
    const handleChangePassword = async (values: any) => {
        setPassLoading(true);
        try {
            // 1. Lấy token hiện tại để xác thực
            const token = await getAuthCookie();
            
            if (!token) {
                message.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                setPassLoading(false);
                return;
            }

            // 2. Tạo object datauser chứa đầy đủ thông tin cần thiết
            const dataUserPayload = {
                token: token,                    // Token để định danh user
                old_password: values.oldPassword, // Mật khẩu cũ từ form
                new_password: values.newPassword  // Mật khẩu mới từ form
            };

            // 3. Gọi server action với 1 tham số object duy nhất
            const response = await change_password(dataUserPayload);
            console.log(response);
            if (response && response.success) {
                message.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
                setIsPassModalOpen(false);
                passForm.resetFields();
            } else {
                message.error(response?.message || 'Mật khẩu cũ không chính xác hoặc có lỗi xảy ra.');
            }
        } catch (error) {
            console.error('Change password error:', error);
            message.error('Lỗi kết nối hệ thống.');
        } finally {
            setPassLoading(false);
        }
    };

    // --- STYLES CONFIGURATION ---
    const pageStyle: React.CSSProperties = {
        minHeight: '100vh',
        background: '#f0f2f5',
        paddingBottom: '40px',
    };

    const headerBackgroundStyle: React.CSSProperties = {
        height: '280px',
        background: 'linear-gradient(120deg, #1890ff 0%, #0050b3 100%)',
        marginBottom: '-100px',
        borderRadius: '0 0 50% 10% / 0 0 20px 20px',
        position: 'relative',
        overflow: 'hidden'
    };

    const cardStyle: React.CSSProperties = {
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
        border: 'none',
        overflow: 'hidden',
        background: '#ffffff'
    };

    if (loading) {
        return (
            <div style={{ padding: '50px', display: 'flex', justifyContent: 'center', background: '#f0f2f5', minHeight: '100vh' }}>
                <Skeleton active avatar paragraph={{ rows: 6 }} style={{ maxWidth: 800 }} />
            </div>
        );
    }

    return (
        <div style={pageStyle}>
            {/* Header Background */}
            <div style={headerBackgroundStyle}>
                <div style={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: 50, left: 50, width: 100, height: 100, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
                
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px', color: '#fff', textAlign: 'center' }}>
                    <Title level={2} style={{ color: '#fff', marginBottom: 8 }}>Hồ Sơ Cá Nhân</Title>
                    <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>Quản lý thông tin tài khoản và hoạt động thư viện</Text>
                </div>
            </div>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
                <Row gutter={[24, 24]}>
                    {/* --- LEFT COLUMN: PROFILE CARD --- */}
                    <Col xs={24} lg={8}>
                        <Card style={cardStyle} bodyStyle={{ padding: '100px 24px 30px 24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-60px' }}>
                                
                                {/* Avatar */}
                                <div style={{ 
                                    padding: '4px', 
                                    background: '#fff', 
                                    borderRadius: '50%', 
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    width: 128, height: 128,
                                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                                }}>
                                    {userInfo?.avatar ? (
                                        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
                                            <Image 
                                                src={userInfo.avatar.startsWith('http') ? userInfo.avatar : `/api/get_file?file=${userInfo.avatar}`}
                                                alt="Avatar" fill style={{ objectFit: 'cover' }} sizes="128px"
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#fde3cf', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#f56a00', fontSize: '48px', fontWeight: 600 }}>
                                            {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : <UserOutlined />}
                                        </div>
                                    )}
                                </div>
                                
                                <Title level={3} style={{ marginTop: 16, marginBottom: 4 }}>
                                    {userInfo?.name || 'Người dùng'}
                                </Title>

                                <div style={{ width: '100%', marginTop: 24 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                                        <Text type="secondary"><SafetyCertificateOutlined /> ID Tài khoản</Text>
                                        <Text strong>{userInfo?.id || '---'}</Text>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                                        <Text type="secondary"><MailOutlined /> Email</Text>
                                        <Text strong ellipsis style={{ maxWidth: '180px' }}>{userInfo?.email || '---'}</Text>
                                    </div>
                                </div>
                                
                                <Button type="dashed" block icon={<CameraOutlined />} style={{ marginTop: 24 }}>
                                    Đổi ảnh đại diện
                                </Button>
                            </div>
                        </Card>

                        {/* Quick Menu */}
                        <Card style={{ ...cardStyle, marginTop: 24 }} title="Menu Quản Lý">
                            <Space direction="vertical" style={{ width: '100%' }} size={4}>
                                <Button type="text" block style={{ textAlign: 'left', height: 45 }} icon={<UserOutlined />}>Thông tin cá nhân</Button>
                                <Button type="text" block style={{ textAlign: 'left', height: 45 }} icon={<HistoryOutlined />}>Lịch sử mượn trả</Button>
                                <Button type="text" block style={{ textAlign: 'left', height: 45 }} icon={<BookOutlined />}>Sách đang mượn</Button>
                                <Button type="text" block style={{ textAlign: 'left', height: 45 }} icon={<SafetyCertificateOutlined />} onClick={() => setIsPassModalOpen(true)}>Đổi mật khẩu</Button>
                            </Space>
                        </Card>
                    </Col>

                    {/* --- RIGHT COLUMN: MAIN CONTENT --- */}
                    <Col xs={24} lg={16}>
                        {/* Quick Stats */}
                        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                            <Col xs={12} sm={6}>
                                <Card style={{ ...cardStyle, textAlign: 'center' }} bodyStyle={{ padding: 16 }}>
                                    <Statistic title="Đang mượn" value={3} valueStyle={{ color: '#1890ff', fontWeight: 'bold' }} prefix={<ReadOutlined />} />
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card style={{ ...cardStyle, textAlign: 'center' }} bodyStyle={{ padding: 16 }}>
                                    <Statistic title="Đã trả" value={27} valueStyle={{ color: '#52c41a', fontWeight: 'bold' }} />
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card style={{ ...cardStyle, textAlign: 'center' }} bodyStyle={{ padding: 16 }}>
                                    <Statistic title="Vi phạm" value={0} valueStyle={{ color: '#ff4d4f', fontWeight: 'bold' }} />
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card style={{ ...cardStyle, textAlign: 'center' }} bodyStyle={{ padding: 16 }}>
                                    <Statistic title="Điểm tích lũy" value={120} valueStyle={{ color: '#faad14', fontWeight: 'bold' }} />
                                </Card>
                            </Col>
                        </Row>

                        {/* Main Tabs */}
                        <Card style={cardStyle}>
                            <Tabs
                                defaultActiveKey="1"
                                size="large"
                                items={[
                                    {
                                        key: '1',
                                        label: <span><UserOutlined /> Cập nhật thông tin</span>,
                                        children: (
                                            <div style={{ paddingTop: 16 }}>
                                                <Form form={form} layout="vertical" onFinish={handleUpdate}>
                                                    <Row gutter={24}>
                                                        <Col xs={24} md={12}>
                                                            <Form.Item label="Họ và tên" name="username" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                                                                <Input size="large" prefix={<UserOutlined className="site-form-item-icon" />} />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col xs={24} md={12}>
                                                            <Form.Item label="Mã sinh viên / ID" name="studentId">
                                                                <Input size="large" disabled style={{ color: '#595959', cursor: 'default' }} />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col xs={24} md={12}>
                                                            <Form.Item label="Email" name="email">
                                                                <Input size="large" disabled prefix={<MailOutlined />} />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col xs={24} md={12}>
                                                            <Form.Item label="Số điện thoại" name="phone">
                                                                <Input size="large" prefix={<PhoneOutlined />} placeholder="Cập nhật SĐT..." />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={24}>
                                                            <Form.Item label="Địa chỉ liên hệ" name="address">
                                                                <Input.TextArea rows={3} showCount maxLength={200} placeholder="Nhập địa chỉ của bạn..." />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                    <Divider />
                                                    <div style={{ textAlign: 'right' }}>
                                                        <Space>
                                                            <Button size="large">Hủy bỏ</Button>
                                                            <Button type="primary" htmlType="submit" size="large" icon={<EditOutlined />}>Lưu thay đổi</Button>
                                                        </Space>
                                                    </div>
                                                </Form>
                                            </div>
                                        )
                                    },
                                    {
                                        key: '2',
                                        label: <span><SafetyCertificateOutlined /> Bảo mật</span>,
                                        children: (
                                            <div style={{ padding: '20px 0', textAlign: 'center' }}>
                                                <div style={{ width: 100, height: 100, background: '#f5f5f5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                                     <SafetyCertificateOutlined style={{ fontSize: 40, color: '#1890ff' }} />
                                                </div>
                                                <Title level={4}>Đổi mật khẩu</Title>
                                                <Paragraph type="secondary">Vui lòng sử dụng mật khẩu mạnh để bảo vệ tài khoản của bạn.</Paragraph>
                                                <Button 
                                                    type="primary" 
                                                    danger 
                                                    ghost 
                                                    size="large"
                                                    icon={<LockOutlined />}
                                                    onClick={() => setIsPassModalOpen(true)}
                                                >
                                                    Đổi mật khẩu ngay
                                                </Button>
                                            </div>
                                        )
                                    }
                                ]}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* --- MODAL ĐỔI MẬT KHẨU --- */}
            <Modal
                title={null}
                open={isPassModalOpen}
                onCancel={() => {
                    setIsPassModalOpen(false);
                    passForm.resetFields();
                }}
                footer={null}
                centered
                width={450}
                styles={{ content: { borderRadius: '16px', overflow: 'hidden', padding: 0 } }}
            >
                <div style={{ background: '#f5f5f5', padding: '30px 20px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ 
                        width: 60, height: 60, background: '#fff', borderRadius: '50%', 
                        margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                    }}>
                        <LockOutlined style={{ fontSize: 28, color: '#ff4d4f' }} />
                    </div>
                    <Title level={4} style={{ margin: 0 }}>Đổi Mật Khẩu</Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>Tăng cường bảo mật cho tài khoản của bạn</Text>
                </div>

                <div style={{ padding: '24px 32px' }}>
                    <Form
                        form={passForm}
                        layout="vertical"
                        onFinish={handleChangePassword}
                    >
                        <Form.Item
                            name="oldPassword"
                            label="Mật khẩu hiện tại"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                        >
                            <Input.Password 
                                size="large" 
                                prefix={<KeyOutlined style={{ color: '#bfbfbf' }} />} 
                                placeholder="Nhập mật khẩu cũ..." 
                                style={{ borderRadius: 8 }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="newPassword"
                            label="Mật khẩu mới"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                            ]}
                        >
                            <Input.Password 
                                size="large" 
                                prefix={<SafetyCertificateOutlined style={{ color: '#bfbfbf' }} />} 
                                placeholder="Nhập mật khẩu mới..." 
                                style={{ borderRadius: 8 }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            label="Xác nhận mật khẩu mới"
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: 'Vui lòng nhập lại mật khẩu mới' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password 
                                size="large" 
                                prefix={<CheckCircleOutlined style={{ color: '#bfbfbf' }} />} 
                                placeholder="Nhập lại mật khẩu mới..." 
                                style={{ borderRadius: 8 }}
                            />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 0, marginTop: 12 }}>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                block 
                                size="large" 
                                loading={passLoading}
                                style={{ height: 45, borderRadius: 8, background: '#1890ff' }}
                            >
                                Xác nhận đổi mật khẩu
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
        </div>
    )
}