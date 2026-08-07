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
    '@react-pdf/renderer', 
    'html2canvas', 
    'jspdf', 
    '@jsquash/jpeg',
    '@jsquash/webp',
    '@jsquash/avif',
    'upng-js'
  ],
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
  turbopack: {},
};

export default nextConfig;
