/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['images.unsplash.com', 'plus.unsplash.com', 'picsum.photos'],
    },
    optimizeFonts: false,
    typescript: {
        ignoreBuildErrors: true
    },
    eslint: {
        ignoreDuringBuilds: true
    },
    experimental: {
        serverActions: true
    },
    webpack: (config) => {
        // Simple configuration without workers
        config.optimization = {
            minimize: false,
            concatenateModules: false
        };
        return config;
    }
}

module.exports = nextConfig;
