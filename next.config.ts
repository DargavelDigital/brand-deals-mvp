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
  // Temporarily disable aggressive webpack optimizations to fix lucide-react issue
  // webpack: (config, { isServer }) => {
  //   // Fix for Next.js 15.5.0 vendor chunks issue
  //   if (!isServer) {
  //     config.optimization = {
  //       ...config.optimization,
  //       splitChunks: {
  //         ...config.optimization.splitChunks,
  //         cacheGroups: {
  //           ...config.optimization.splitChunks.cacheGroups,
  //           vendor: {
  //             test: /[\\/]node_modules[\\/]/,
  //             name: 'vendors',
  //             chunks: 'all',
  //             enforce: false, // Changed from true to false
  //             priority: 10, // Lower priority to avoid conflicts
  //           },
  //         },
  //       },
  //     };
  //   }
  //   return config;
  // },
};

export default withNextIntl(nextConfig);
