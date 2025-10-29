'use client'

import React, { createContext, useState, useMemo, ReactNode } from 'react'
import { BorrowedBook, Book } from '../types'

interface BorrowContextType {
  borrowedBooks: BorrowedBook[]
  borrowBook: (book: Book) => void
  returnBook: (bookId: string) => void
  renewBook: (bookId: string) => void
  reserveBook: (bookId: string) => void
  borrowedCount: number
}

export const BorrowContext = createContext<BorrowContextType | undefined>(undefined)

export const BorrowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([])

  const borrowBook = (book: Book) => {
    const newBorrowedBook: BorrowedBook = {
      ...book,
      borrowDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      renewCount: 0,
    }
    setBorrowedBooks(prev => [...prev, newBorrowedBook])
  }

  const returnBook = (bookId: string) => {
    setBorrowedBooks(prev => prev.filter(book => book.id !== bookId))
  }

  const renewBook = (bookId: string) => {
    setBorrowedBooks(prev => 
      prev.map(book => 
        book.id === bookId 
          ? { 
              ...book, 
              dueDate: new Date(new Date(book.dueDate).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // extend 14 days
              renewCount: book.renewCount + 1 
            }
          : book
      )
    )
  }

  const reserveBook = (bookId: string) => {
    // Implementation for book reservation
    console.log('Book reserved:', bookId)
  }

  const borrowedCount = useMemo(() => {
    return borrowedBooks.length
  }, [borrowedBooks])

  const value = useMemo(() => ({
    borrowedBooks,
    borrowBook,
    returnBook,
    renewBook,
    reserveBook,
    borrowedCount,
  }), [borrowedBooks, borrowedCount])

  return <BorrowContext.Provider value={value}>{children}</BorrowContext.Provider>
}