'use client'

import React, { useEffect, useState } from 'react'
import { ConfigProvider, theme } from 'antd';
const { defaultAlgorithm, darkAlgorithm } = theme;

import { AuthProvider } from '../lib/context/AuthContext';
import { ThemeProvider, useTheme } from '../lib/context/ThemeContext';
import { CartProvider } from '../lib/hooks/useCart';
import { BorrowProvider } from '@/lib/context/BorrowContext';

const AntdConfigProvider = ({ children }: { children: React.ReactNode }) => {
    const { theme: appTheme } = useTheme();
    const [currentAlgorithm, setCurrentAlgorithm] = useState(() => defaultAlgorithm);

    useEffect(() => {
        const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (appTheme === 'dark' || (appTheme === 'system' && isDarkMode)) {
            setCurrentAlgorithm(() => darkAlgorithm);
        } else {
            setCurrentAlgorithm(() => defaultAlgorithm);
        }
    }, [appTheme]);

    return (
        <ConfigProvider
            theme={{
                algorithm: currentAlgorithm,
            }}
        >
            {children}
        </ConfigProvider>
    );
};

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BorrowProvider>
                    <CartProvider>
                        <AntdConfigProvider>
                            {children}
                        </AntdConfigProvider>
                    </CartProvider>
                </BorrowProvider>
            </AuthProvider>
        </ThemeProvider>
    )
}
