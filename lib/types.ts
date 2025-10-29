export interface Book {
    id: string
    title: string
    author: string
    publisher: string
    publishYear: number
    isbn: string
    category: string
    description: string
    coverUrl: string
    totalCopies: number
    availableCopies: number
    rating: number
    reviews: number
    tags: string[]
    // Legacy fields for backward compatibility
    books_id?: number
    Title?: string
    Author?: string
    Publisher?: string
    DocumentType?: string
    Description?: string
    ISBN?: string | null
    PublishYear?: number
    Language?: string
    IsPublic?: number
    UploadDate?: string
    UploadedBy?: string
    image?: string | null
}

export interface BorrowedBook extends Book {
    borrowDate: string
    dueDate: string
    renewCount: number
}

export enum UserRole {
    STUDENT = 'student',
    FACULTY = 'faculty',
    LIBRARIAN = 'librarian',
    ADMIN = 'admin',
}

export interface User {
    id: string
    name: string
    email: string
    studentId?: string
    facultyId?: string
    department: string
    role: UserRole
}

export enum BorrowStatus {
    ACTIVE = 'active',
    RETURNED = 'returned',
    OVERDUE = 'overdue',
    RENEWED = 'renewed',
    LOST = 'lost',
}

export interface BorrowRecord {
    id: string
    userId: string
    bookId: string
    borrowDate: string
    dueDate: string
    returnDate?: string
    renewCount: number
    status: BorrowStatus
    fine?: number
}

export interface LibraryNews {
    id: string
    title: string
    excerpt: string
    content: string
    imageUrl: string
    author: string
    publishedAt: string
    category: string
}

export interface Reservation {
    id: string
    userId: string
    bookId: string
    reservedAt: string
    expiresAt: string
    status: 'pending' | 'ready' | 'expired'
}

export interface LibraryEvent {
    id: string
    title: string
    description: string
    date: string
    time: string
    location: string
    capacity: number
    registered: number
    category: 'workshop' | 'seminar' | 'exhibition' | 'other'
}

export interface ContactMessage {
    id: string
    name: string
    email: string
    subject: string
    message: string
    createdAt: string
}

export interface StudyRoom {
    id: string
    name: string
    capacity: number
    facilities: string[]
    isAvailable: boolean
    bookings: RoomBooking[]
}

export interface RoomBooking {
    id: string
    userId: string
    roomId: string
    date: string
    startTime: string
    endTime: string
    purpose: string
    status: 'confirmed' | 'pending' | 'cancelled'
}

export interface Product {
    id: string
    name: string
    description: string
    price: number
    category: string
    imageUrl: string
    rating: number
    reviews: number
    inStock: boolean
    tags: string[]
}