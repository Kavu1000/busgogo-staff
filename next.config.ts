import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // This is the crucial line for S3 hosting
  images: {
    unoptimized: true, // S3 cannot process images dynamically
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
