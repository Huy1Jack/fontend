import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MOCK_PRODUCTS } from '../../../lib/constants'
import ProductDetailPage from '../../components/ProductDetailPage'

interface Props {
    params: {
        productId: string
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const product = MOCK_PRODUCTS.find(p => p.id === params.productId)

    if (!product) {
        return {
            title: 'Sản phẩm không tìm thấy'
        }
    }

    return {
        title: product.name,
        description: product.description,
    }
}

export default function Page({ params }: Props) {
    const product = MOCK_PRODUCTS.find(p => p.id === params.productId)

    if (!product) {
        notFound()
    }

    return <ProductDetailPage product={product} />
}