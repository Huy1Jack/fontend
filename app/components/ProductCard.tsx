'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Product } from '../../lib/types'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { useCart } from '../../lib/hooks/useCart'
import { Star, ShoppingCart } from 'lucide-react'
import { formatPrice } from '../../lib/utils'

interface ProductCardProps {
    product: Product
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { addToCart } = useCart()

    return (
        <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary/20">
            <CardHeader className="p-0">
                <Link href={`/products/${product.id}`}>
                    <div className="relative w-full h-48">
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover rounded-t-lg"
                        />
                    </div>
                </Link>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
                <p className="text-sm text-muted-foreground">{product.category}</p>
                <CardTitle className="text-lg mt-1 mb-2 leading-tight">
                    <Link href={`/products/${product.id}`} className="hover:text-primary">
                        {product.name}
                    </Link>
                </CardTitle>
                <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                    <span className="text-sm text-muted-foreground">
                        {product.rating} ({product.reviews} đánh giá)
                    </span>
                </div>
            </CardContent>
            <CardFooter className="p-4 flex justify-between items-center">
                <span className="text-xl font-bold text-primary">
                    {formatPrice(product.price)}
                </span>
                <Button size="sm" onClick={() => addToCart(product)}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Thêm vào giỏ
                </Button>
            </CardFooter>
        </Card>
    )
}

export default ProductCard