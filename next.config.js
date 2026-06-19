/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        // In local dev, the Node server can hit TLS issues fetching remote
        // placeholder images. Serving them unoptimized lets the browser load
        // them directly. Cloudinary images in production are already optimized.
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'placehold.co',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
        ],
    },
}

module.exports = nextConfig
