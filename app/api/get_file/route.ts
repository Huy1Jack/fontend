import { NextRequest, NextResponse } from 'next/server';
import { readFile, access } from 'fs/promises';
import { join } from 'path';
import { getAuthCookie } from '@/app/sever/authcookie/route';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        
        // Lấy đường dẫn file từ query parameter
        const { searchParams } = new URL(request.url);
        const filePath = searchParams.get('file');

        if (!filePath) {
            return NextResponse.json({
                success: false,
                message: 'Thiếu tham số file'
            }, { status: 400 });
        }

        // Chỉ cần đăng nhập là có thể truy cập

        // Tạo đường dẫn đầy đủ đến file
        const fullFilePath = join(process.cwd(), 'private', filePath);

        try {
            // Kiểm tra file có tồn tại không
            await access(fullFilePath);

            // Đọc file
            const fileBuffer = await readFile(fullFilePath);

            // Xác định MIME type dựa trên extension
            const extension = filePath.split('.').pop()?.toLowerCase();
            const mimeType = getMimeType(extension || '');

            // Tạo response với file
            const response = new NextResponse(fileBuffer as any);
            response.headers.set('Content-Type', mimeType);
            response.headers.set('Content-Disposition', `inline; filename="${filePath.split('/').pop()}"`);
            response.headers.set('Cache-Control', 'private, max-age=3600');

            return response;

        } catch (fileError) {
            return NextResponse.json({
                success: false,
                message: 'File không tồn tại'
            }, { status: 404 });
        }

    } catch (error) {
        console.error('Get file error:', error);
        return NextResponse.json({
            success: false,
            message: 'Có lỗi xảy ra khi truy xuất file'
        }, { status: 500 });
    }
}

// Hàm kiểm tra quyền truy cập file
function checkFileAccess(userRole: number, userEmail: string, filePath: string): boolean {
    // Role 0, 1 và 2 có thể truy cập tất cả file
    if (userRole === 0 || userRole === 1 || userRole === 2) {
        return true;
    }

    // Role 3 chỉ có thể truy cập file của chính mình
    if (userRole === 3) {
        // Trích xuất email từ đường dẫn file
        // Format: MHS7-11-2025/email/tieu-chuan-x/tieu-chi-x/filename
        const pathParts = filePath.split('/');
        if (pathParts.length >= 2) {
            const emailInPath = pathParts[1];
            return emailInPath === userEmail;
        }
    }

    return false;
}

// Hàm xác định MIME type
function getMimeType(extension: string): string {
    const mimeTypes: { [key: string]: string } = {
        'pdf': 'application/pdf',
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'txt': 'text/plain',
        'csv': 'text/csv'
    };

    return mimeTypes[extension] || 'application/octet-stream';
}