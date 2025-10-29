'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Product } from '../../lib/types'
import { useCart } from '../../lib/hooks/useCart'
import { Button } from './ui/Button'
import { Star, ShoppingCart, ArrowLeft } from 'lucide-react'
import ProductCard from './ProductCard'
import { formatPrice } from '../../lib/utils'
import { MOCK_PRODUCTS } from '../../lib/constants'

interface ProductDetailPageProps {
    product: Product
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product }) => {
    const { addToCart } = useCart()

    const relatedProducts = MOCK_PRODUCTS
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4)

    return (
        <div className="container max-w-7xl mx-auto px-4 py-8">
            {/* Back button */}
            <Link href="/products" className="inline-flex items-center text-primary hover:underline mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại trang sản phẩm
            </Link>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                <div>
                    <div className="relative aspect-square">
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover rounded-lg shadow-lg"
                        />
                    </div>
                </div>
                <div>
                    <p className="text-sm font-semibold text-primary uppercase">{product.category}</p>
                    <h1 className="text-4xl font-extrabold my-2 tracking-tight">{product.name}</h1>
                    <div className="flex items-center my-4">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-5 h-5 ${i < Math.round(product.rating)
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="ml-2 text-sm text-muted-foreground">
                            {product.rating} ({product.reviews} đánh giá)
                        </span>
                    </div>
                    <p className="text-6xl font-bold text-primary my-6">{formatPrice(product.price)}</p>
                    <p className="text-lg leading-relaxed mb-6">{product.description}</p>

                    <div className="flex items-center space-x-4 mb-6">
                        <span className="text-sm text-muted-foreground">Còn lại:</span>
                        <span className="font-semibold">{product.stock} sản phẩm</span>
                    </div>

                    <div className="flex space-x-4">
                        <Button
                            size="lg"
                            onClick={() => addToCart(product)}
                            className="flex-1"
                        >
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Thêm vào giỏ hàng
                        </Button>
                        <Button variant="outline" size="lg">
                            Mua ngay
                        </Button>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <section className="mt-16">
                    <h2 className="text-2xl font-bold mb-6">Sản phẩm liên quan</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {relatedProducts.map((relatedProduct) => (
                            <ProductCard key={relatedProduct.id} product={relatedProduct} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}

export default ProductDetailPage