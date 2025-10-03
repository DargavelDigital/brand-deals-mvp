import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Redirects from Netlify (currently empty, ready for future redirects)
  async redirects() {
    return [
      // { source: '/old', destination: '/new', permanent: true },
    ]
  },
  // Security headers ported from _headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { 
            key: 'Content-Security-Policy', 
            value: "default-src 'self'; img-src * data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval'; connect-src *; frame-src *; font-src *; object-src 'none'" 
          }
        ]
      }
    ]
  },
  // Remote image patterns for social media and CDNs
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.instagram.com' },
      { protocol: 'https', hostname: '**.tiktokcdn.com' },
      { protocol: 'https', hostname: '**.fbcdn.net' },
      { protocol: 'https', hostname: '**.cloudfront.net' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: '**.youtube.com' },
      { protocol: 'https', hostname: '**.ytimg.com' },
      { protocol: 'https', hostname: '**.linkedin.com' },
      { protocol: 'https', hostname: '**.twitter.com' },
      { protocol: 'https', hostname: '**.twimg.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: '**.gravatar.com' },
      { protocol: 'https', hostname: '**.githubusercontent.com' }
    ]
  },
  // Fix for Next.js 15.5.0 vendor chunks issue
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              enforce: false, // Changed from true to false
              priority: 10, // Lower priority to avoid conflicts
            },
          },
        },
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
