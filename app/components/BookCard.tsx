'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Book } from '../../lib/types'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { useBorrow } from '../../lib/hooks/useBorrow'
import { Star, BookOpen, Heart } from 'lucide-react'
import { useFavorites } from '../../lib/hooks/useFavorites'

interface BookCardProps {
    book: Book
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
    const { borrowBook } = useBorrow()
    const { isFavorite, toggleFavorite } = useFavorites()

    const targetId = (book as any).books_id ?? (book as any).id
    const detailsHref = `/books/details?books_id=${encodeURIComponent(String(targetId))}`

    return (
        <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary/20">
            <CardHeader className="p-0">
                <Link href={detailsHref}>
                    <div className="relative w-full h-48">
                        <Image
                            src={book.coverUrl}
                            alt={book.title}
                            fill
                            className="object-cover rounded-t-lg"
                        />
                        <button
                            aria-label="toggle-favorite"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(targetId) }}
                            className="absolute top-2 right-2 bg-white/80 hover:bg-white/90 rounded-md p-1"
                        >
                            <Heart className={`w-4 h-4 ${isFavorite(targetId) ? 'text-red-500 fill-current' : 'text-gray-500'}`} />
                        </button>
                    </div>
                </Link>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
                <p className="text-sm text-muted-foreground">{book.category}</p>
                <CardTitle className="text-lg mt-1 mb-2 leading-tight">
                    <Link href={detailsHref} className="hover:text-primary">
                        {book.title}
                    </Link>
                </CardTitle>
                <p className="text-sm text-muted-foreground mb-2">Tác giả: {book.author}</p>
                <p className="text-sm text-muted-foreground mb-2">NXB: {book.publisher} ({book.publishYear})</p>
                <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                    <span className="text-sm text-muted-foreground">
                        {book.rating} ({book.reviews} đánh giá)
                    </span>
                </div>
                <p className="text-sm mt-2">
                    <span className="text-green-600">Còn {book.availableCopies}/{book.totalCopies} cuốn</span>
                </p>
            </CardContent>
            <CardFooter className="p-4 flex justify-between items-center">
                <span className="text-sm font-medium">
                    ISBN: {book.isbn}
                </span>
                <Button
                    size="sm"
                    onClick={() => borrowBook(book)}
                    disabled={book.availableCopies === 0}
                >
                    <BookOpen className="w-4 h-4 mr-2" />
                    {book.availableCopies > 0 ? 'Mượn sách' : 'Hết sách'}
                </Button>
            </CardFooter>
        </Card>
    )
}

export default BookCard