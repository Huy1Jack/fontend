"use client";
import { useEffect, useState } from 'react';
import { Table, Space, Button, Card, Image, Typography, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { get_news } from '@/app/sever/admin/route';
import type { ColumnsType } from 'antd/es/table';

const { Text, Paragraph } = Typography;

interface News {
  id: number;
  title: string;
  content: string;
  author: string;
  create_at: string;
  image_url: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await get_news({});
      
      if (response.success) {
        setNews(response.data || []);
      } else {
        message.error(response.message || 'Lỗi khi tải dữ liệu tin tức');
      }
    } catch (error) {
      message.error('Không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<News> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tiêu đề & Nội dung',
      key: 'content',
      render: (_, record) => (
        <Space direction="vertical">
          <Text strong>{record.title}</Text>
          <Paragraph ellipsis={{ rows: 2 }} className="text-gray-600">
            {record.content}
          </Paragraph>
        </Space>
      ),
    },
    {
      title: 'Ảnh',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 120,
      render: (image_url) => (
        <Image
          src={image_url}
          alt="News thumbnail"
          width={100}
          height={60}
          className="object-cover rounded"
          fallback="/placeholder-image.jpg"
        />
      ),
    },
    {
      title: 'Tác giả',
      dataIndex: 'author',
      key: 'author',
      width: 150,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'create_at',
      key: 'create_at',
      width: 200,
      render: (date) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="primary"
            onClick={() => {
              // Handle edit news
            }}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              // Handle delete news
            }}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý tin tức</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            // Handle add new news
          }}
        >
          Thêm tin tức
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table
          columns={columns}
          dataSource={news}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} tin tức`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
}
