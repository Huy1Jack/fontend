'use client'

import { useContext } from 'react'
import { BorrowContext } from '../context/BorrowContext'

export const useBorrow = () => {
  const context = useContext(BorrowContext)
  if (context === undefined) {
    throw new Error('useBorrow must be used within a BorrowProvider')
  }
  return context
}