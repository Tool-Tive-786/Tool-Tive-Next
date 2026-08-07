import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // REQUIRED for Cloudflare Pages deployment to prevent 500 Image Errors
  images: {
    unoptimized: true,
  },
  // Ensure heavy PDF/Canvas libraries are handled correctly on the server/edge
  serverExternalPackages: [
    'html2canvas', 
    'jspdf', 
    'upng-js'
  ],
  async headers() {
    return [
      {
        // Apply strict security headers to all routes globally
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
