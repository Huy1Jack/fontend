'use client'

import React from 'react'
import { AuthProvider } from '../lib/context/AuthContext'
import { BorrowProvider } from '../lib/context/BorrowContext'
import { ThemeProvider } from '../lib/context/ThemeContext'
import { CartProvider } from '../lib/hooks/useCart'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BorrowProvider>
                    <CartProvider>
                        {children}
                    </CartProvider>
                </BorrowProvider>
            </AuthProvider>
        </ThemeProvider>
    )
}