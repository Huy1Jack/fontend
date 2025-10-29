/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            'images.unsplash.com',
            'plus.unsplash.com',
            'picsum.photos',
        ],
    },
    typescript: {
        ignoreBuildErrors: false,
    },
    eslint: {
        ignoreDuringBuilds: false,
    },
    experimental: {
        serverActions: true, // ✅ Bật tính năng Server Actions
    },
}

module.exports = nextConfig;
