import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
    ],
  },
  transpilePackages: ['pdfjs-dist'],
  turbopack: {
    resolveAlias: {
      // Map 'canvas' to an empty module (works with Turbopack)
      canvas: './empty-module.js',
    },
  },
};

export default nextConfig;