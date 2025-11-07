import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price)
}

export function formatDate(date: string): string {
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(date))
}

export function decodeJWT(token: string): { name: string; email: string } | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }
        
        const payload = parts[1];
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        const parsed = JSON.parse(decoded);
        
        return {
            name: parsed.name || '',
            email: parsed.email || ''
        };
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
}

export const add_book_admin = async (data: any) => {
    try {
        const response = await fetch("/api/books/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return await response.json();
    } catch (error) {
        console.error("Error adding book:", error);
        return { success: false, message: "Failed to add book" };
    }
};

export const fetchAuthors = async () => {
    try {
        const response = await fetch("/api/authors");
        return await response.json();
    } catch (error) {
        console.error("Error fetching authors:", error);
        return { success: false, data: [] };
    }
};

export const fetchCategories = async () => {
    try {
        const response = await fetch("/api/categories");
        return await response.json();
    } catch (error) {
        console.error("Error fetching categories:", error);
        return { success: false, data: [] };
    }
};

export const fetchPublishers = async () => {
    try {
        const response = await fetch("/api/publishers");
        return await response.json();
    } catch (error) {
        console.error("Error fetching publishers:", error);
        return { success: false, data: [] };
    }
};