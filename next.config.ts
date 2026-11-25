import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    proxyTimeout: 300000, // 5 minutes in ms to prevent ECONNRESET on slow OCR processing
  },
  async redirects() {
    return [
      {
        source: '/km',
        destination: '/',
        permanent: false,
      },
      {
        source: '/en',
        destination: '/',
        permanent: false,
      },
      {
        source: '/km/:path*',
        destination: '/:path*',
        permanent: false,
      },
      {
        source: '/en/:path*',
        destination: '/:path*',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      // Hide backend URL by reverse proxying all API requests through Next.js
      {
        source: '/api/v1/:path*',
        destination: 'https://3-25-134-111.sslip.io/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
