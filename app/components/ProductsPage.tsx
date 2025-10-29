'use client'

import React, { useState, useMemo } from 'react'
import { MOCK_PRODUCTS, CATEGORIES } from '../../lib/constants'
import ProductCard from './ProductCard'
import { Input } from './ui/Input'

const ProductsPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('Tất cả')
    const [sortBy, setSortBy] = useState('name-asc')

    const filteredAndSortedProducts = useMemo(() => {
        let products = MOCK_PRODUCTS.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        )

        if (selectedCategory !== 'Tất cả') {
            products = products.filter(p => p.category === selectedCategory)
        }

        products.sort((a, b) => {
            switch (sortBy) {
                case 'price-asc': return a.price - b.price
                case 'price-desc': return b.price - a.price
                case 'rating-desc': return b.rating - a.rating
                case 'name-asc': return a.name.localeCompare(b.name)
                case 'name-desc': return b.name.localeCompare(a.name)
                default: return 0
            }
        })

        return products
    }, [searchTerm, selectedCategory, sortBy])

    return (
        <div className="container max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Tất Cả Sản Phẩm</h1>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-muted/50 rounded-lg">
                <Input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                    {CATEGORIES.map(category => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                    <option value="name-asc">Tên A-Z</option>
                    <option value="name-desc">Tên Z-A</option>
                    <option value="price-asc">Giá thấp đến cao</option>
                    <option value="price-desc">Giá cao đến thấp</option>
                    <option value="rating-desc">Đánh giá cao nhất</option>
                </select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredAndSortedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {filteredAndSortedProducts.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-lg text-muted-foreground">Không tìm thấy sản phẩm nào phù hợp với tiêu chí tìm kiếm.</p>
                </div>
            )}
        </div>
    )
}

export default ProductsPage