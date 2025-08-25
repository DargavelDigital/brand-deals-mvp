import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove static export for API functionality
  // output: 'export',
  // trailingSlash: true,
  // images: {
  //   unoptimized: true
  // },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
};

export default nextConfig;
