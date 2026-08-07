import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: [
    'html2canvas', 
    'jspdf', 
    'upng-js'
  ],
  turbopack: {},
};

export default nextConfig;
