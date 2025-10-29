'use client'

import React, { createContext, useState, useMemo, useEffect } from 'react'
import { User, UserRole } from '../types'
import { MOCK_USERS } from '../constants'
import { decodeJWT } from '../utils'
import { getAuthCookie } from '@/app/sever/authcookie/route'

interface AuthContextType {
    user: User | null
    login: (email: string) => boolean
    logout: () => void
    register: (name: string, email: string, department: string, studentId?: string) => boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)

    // Check for existing JWT token on component mount
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const token = await getAuthCookie()
                if (token) {
                    const decoded = decodeJWT(token)
                    if (decoded) {
                        // Create user object from JWT payload
                        const userFromToken: User = {
                            id: '1', // You might want to include this in JWT
                            name: decoded.name,
                            email: decoded.email,
                            department: '', // You might want to include this in JWT
                            role: UserRole.STUDENT, // You might want to include this in JWT
                        }
                        setUser(userFromToken)
                    }
                }
            } catch (error) {
                console.error('Error checking auth status:', error)
            }
        }

        checkAuthStatus()
    }, [])

    const login = (email: string): boolean => {
        const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase())
        if (foundUser) {
            setUser(foundUser)
            return true
        }
        return false
    }

    const logout = async () => {
        try {
            // Call logout API to clear server-side cookie
            await fetch('/sever/logout', {
                method: 'GET',
                credentials: 'include'
            })
        } catch (error) {
            console.error('Error during logout:', error)
        } finally {
            // Clear client-side user state
            setUser(null)
        }
    }

    const register = (name: string, email: string, department: string, studentId?: string): boolean => {
        if (MOCK_USERS.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            return false // User already exists
        }
        const newUser: User = {
            id: String(MOCK_USERS.length + 1),
            name,
            email,
            department,
            studentId: studentId,
            role: UserRole.STUDENT,
        }
        MOCK_USERS.push(newUser) // In a real app, this would be an API call
        setUser(newUser)
        return true
    }

    const value = useMemo(() => ({ user, login, logout, register }), [user])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}