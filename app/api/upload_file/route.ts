'use server';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, access, readFile } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';
import { getAuthCookie } from '@/app/sever/authcookie/route';
import axios from 'axios'; // Mặc dù axios không dùng ở đây nữa, nhưng vẫn import phòng khi logic khác cần

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB cho ảnh
const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024; // 50MB cho tài liệu
const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp'
];
const ALLOWED_DOCUMENT_TYPES = [
    'application/pdf'
];

// Hàm tạo tên file ngẫu nhiên
function generateRandomFilename(originalExtension: string): string {
    const randomString = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    return `${randomString}_${timestamp}.${originalExtension}`;
}

// Hàm tính hash của file để kiểm tra trùng lặp
async function getFileHash(buffer: Buffer): Promise<string> {
    return crypto.createHash('md5').update(new Uint8Array(buffer)).digest('hex');
}

// Hàm kiểm tra file đã tồn tại
async function checkFileExists(dirPath: string, fileHash: string): Promise<string | null> {
    try {
        await access(dirPath);
        const files = await readFile(join(dirPath, '.file_hashes.json'), 'utf-8').catch(() => '{}');
        const hashMap = JSON.parse(files);

        for (const [filename, hash] of Object.entries(hashMap)) {
            if (hash === fileHash) {
                return filename as string;
            }
        }
        return null;
    } catch {
        return null;
    }
}

// Hàm lưu hash file
async function saveFileHash(dirPath: string, filename: string, fileHash: string) {
    try {
        const hashFile = join(dirPath, '.file_hashes.json');
        const existingHashes = await readFile(hashFile, 'utf-8').catch(() => '{}');
        const hashMap = JSON.parse(existingHashes);
        hashMap[filename] = fileHash;
        await writeFile(hashFile, JSON.stringify(hashMap, null, 2));
    } catch (error) {
        console.error('Error saving file hash:', error);
    }
}

export async function POST(request: NextRequest) {
    try {
        // Kiểm tra authentication
        const token = await getAuthCookie();
        if (!token) {
            return NextResponse.json({
                success: false,
                message: 'Chưa đăng nhập'
            }, { status: 401 });
        }

        // Giải mã token để lấy thông tin user
        let userEmail: string;
        let quyen: number;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            userEmail = payload.email;
            quyen = payload.role;
            if (!userEmail) {
                throw new Error('Email not found in token');
            }
            if (quyen !== 0 && quyen !== 1 && quyen !== 2) {
                return NextResponse.json({
                    success: false,
                    message: 'Bạn không có quyền upload file'
                }, { status: 403 });
            }
        } catch (error) {
            return NextResponse.json({
                success: false,
                message: 'Token không hợp lệ'
            }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const tieuChuan = formData.get('tieuChuan') as string;
        const tieuChi = formData.get('tieuChi') as string;

        if (!file) {
            return NextResponse.json({
                success: false,
                message: 'Không có file được tải lên'
            }, { status: 400 });
        }

        if (!tieuChuan || !tieuChi) {
            return NextResponse.json({
                success: false,
                message: 'Thiếu thông tin tiêu chuẩn hoặc tiêu chí'
            }, { status: 400 });
        }

        // Kiểm tra loại file và kích thước dựa trên loại
        let maxSize: number;
        let allowedTypes: string[];

        if (tieuChuan === 'book' && tieuChi === 'image') {
            // Ảnh sách: chỉ cho phép ảnh, tối đa 10MB
            maxSize = MAX_FILE_SIZE;
            allowedTypes = ALLOWED_IMAGE_TYPES;
        } else if (tieuChuan === 'book' && tieuChi === 'document') {
            // Tài liệu sách: chỉ cho phép PDF, tối đa 50MB
            maxSize = MAX_DOCUMENT_SIZE;
            allowedTypes = ALLOWED_DOCUMENT_TYPES;
        } else {
            // Các loại file khác: giữ nguyên logic cũ
            maxSize = MAX_FILE_SIZE;
            allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];
        }

        // Kiểm tra kích thước file
        if (file.size > maxSize) {
            const sizeLimit = maxSize === MAX_DOCUMENT_SIZE ? '50MB' : '10MB';
            return NextResponse.json({
                success: false,
                message: `File vượt quá giới hạn ${sizeLimit}`
            }, { status: 400 });
        }

        // Kiểm tra loại file
        if (!allowedTypes.includes(file.type)) {
            const typeMsg = tieuChuan === 'book' && tieuChi === 'image'
                ? 'Chỉ cho phép file ảnh (png, jpg, jpeg, webp)'
                : tieuChuan === 'book' && tieuChi === 'document'
                ? 'Chỉ cho phép file PDF'
                : 'Loại file không được hỗ trợ';
            return NextResponse.json({
                success: false,
                message: typeMsg
            }, { status: 400 });
        }

        // Tạo đường dẫn lưu file
        let uploadDir: string;
        let relativePath: string;
        let filename: string;

        if (tieuChuan === 'book' && tieuChi === 'image') {
            // Upload ảnh sách vào private/books/
            uploadDir = join(process.cwd(), 'private', 'books');
            await mkdir(uploadDir, { recursive: true });

            // Đọc file buffer và tính hash
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const fileHash = await getFileHash(buffer);

            // Kiểm tra file đã tồn tại
            const existingFile = await checkFileExists(uploadDir, fileHash);
            if (existingFile) {
                // Tạo relative path cho file đã tồn tại
                relativePath = `books/${existingFile}`;

                return NextResponse.json({
                    success: true,
                    message: 'File đã tồn tại',
                    filename: existingFile,
                    filepath: relativePath
                });
            }

            // Tạo tên file mới ngẫu nhiên để tránh ký tự đặc biệt và trùng lặp
            const fileExtension = file.name.split('.').pop() || '';
            filename = generateRandomFilename(fileExtension);
            const filePath = join(uploadDir, filename);

            // Lưu file
            await writeFile(filePath, new Uint8Array(buffer));

            // Lưu hash file
            await saveFileHash(uploadDir, filename, fileHash);

            // Tạo relative path cho response
            relativePath = `books/${filename}`;

            return NextResponse.json({
                success: true,
                message: 'Upload thành công',
                filename: filename,
                filepath: relativePath
            });

        } else if (tieuChuan === 'book' && tieuChi === 'document') {
            // Upload tài liệu sách vào private/documents/
            uploadDir = join(process.cwd(), 'private', 'documents');
            await mkdir(uploadDir, { recursive: true });

            // Đọc file buffer và tính hash
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const fileHash = await getFileHash(buffer);

            // Kiểm tra file đã tồn tại
            const existingFile = await checkFileExists(uploadDir, fileHash);
            if (existingFile) {
                // Tạo relative path cho file đã tồn tại
                relativePath = `documents/${existingFile}`;

                return NextResponse.json({
                    success: true,
                    message: 'File đã tồn tại',
                    filename: existingFile,
                    filepath: relativePath
                });
            }

            // Tạo tên file mới ngẫu nhiên để tránh ký tự đặc biệt và trùng lặp
            const fileExtension = file.name.split('.').pop() || '';
            filename = generateRandomFilename(fileExtension);
            const filePath = join(uploadDir, filename);

            // Lưu file
            await writeFile(filePath, new Uint8Array(buffer));

            // Lưu hash file
            await saveFileHash(uploadDir, filename, fileHash);

            // Tạo relative path cho response
            relativePath = `documents/${filename}`;

            // [ĐÃ SỬA] Chỉ trả về thông tin file, không lưu vào DB
            return NextResponse.json({
                success: true,
                message: 'Upload thành công',
                filename: filename,
                filepath: relativePath
            });

        } else {
            // Logic cũ cho các loại file khác
            const now = new Date();
            const dateFolder = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
            uploadDir = join(process.cwd(), 'private', 'MHS' + dateFolder, userEmail, `tieu-chuan-${tieuChuan}`, `tieu-chi-${tieuChi}`);

            // Tạo thư mục nếu chưa tồn tại
            await mkdir(uploadDir, { recursive: true });

            // Đọc file buffer và tính hash
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const fileHash = await getFileHash(buffer);

            // Kiểm tra file đã tồn tại
            const existingFile = await checkFileExists(uploadDir, fileHash);
            if (existingFile) {
                // Tạo relative path cho file đã tồn tại
                relativePath = `MHS${dateFolder}/${userEmail}/${existingFile}`;

                return NextResponse.json({
                    success: true,
                    message: 'File đã tồn tại',
                    filename: existingFile,
                    filepath: relativePath
                });
            }

            // Tạo tên file mới ngẫu nhiên để tránh ký tự đặc biệt và trùng lặp
            const fileExtension = file.name.split('.').pop() || '';
            filename = generateRandomFilename(fileExtension);
            const filePath = join(uploadDir, filename);

            // Lưu file
            await writeFile(filePath, new Uint8Array(buffer));

            // Lưu hash file
            await saveFileHash(uploadDir, filename, fileHash);

            // Tạo relative path cho response
            relativePath = `MHS${dateFolder}/${userEmail}/${filename}`;

            return NextResponse.json({
                success: true,
                message: 'Upload thành công',
                filename: filename,
                filepath: relativePath
            });
        }
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({
            success: false,
            message: 'Có lỗi xảy ra khi upload file'
        }, { status: 500 });
    }
}