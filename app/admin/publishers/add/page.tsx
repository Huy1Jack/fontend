'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { add_publishers } from '@/app/sever/admin/route';

export default function AddPublisher() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    publisher_name: '',
    address: '',
    phone: '',
    email: ''
  });
  console.log(formData);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await add_publishers(formData);
      
      if (response.success) {
        alert('Thêm nhà xuất bản thành công!');
        router.push('/admin/publishers');
        router.refresh();
      } else {
        alert(response.message || 'Có lỗi xảy ra khi thêm nhà xuất bản');
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi thêm nhà xuất bản');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Thêm Nhà Xuất Bản Mới</h1>
      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Tên nhà xuất bản</label>
          <input
            type="text"
            name="publisher_name"
            value={formData.publisher_name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Địa chỉ</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Số điện thoại</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Thêm nhà xuất bản
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/publishers')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}