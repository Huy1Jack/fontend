'use client'

import React, { createContext, useState, useEffect, useMemo } from 'react'

type Theme = 'dark' | 'light' | 'system'

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>('system')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const storedTheme = localStorage.getItem('theme') as Theme | null
        if (storedTheme) {
            setTheme(storedTheme)
        }
    }, [])

    useEffect(() => {
        if (!mounted) return

        const root = window.document.documentElement
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

        root.classList.remove('light', 'dark')

        if (theme === 'system') {
            root.classList.add(systemTheme)
        } else {
            root.classList.add(theme)
        }
    }, [theme, mounted])

    const value = useMemo(() => ({
        theme,
        setTheme: (newTheme: Theme) => {
            localStorage.setItem('theme', newTheme)
            setTheme(newTheme)
        },
    }), [theme])

    if (!mounted) {
        return null
    }

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}