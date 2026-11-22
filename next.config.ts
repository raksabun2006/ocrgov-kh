import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    return [
      // Hide backend URL by reverse proxying all API requests through Next.js
      {
        source: '/api/v1/:path*',
        destination: 'https://3-25-134-111.sslip.io/api/v1/:path*',
      },
      {
        source: '/km',
        destination: '/',
      },
      {
        source: '/en',
        destination: '/',
      },
      {
        source: '/km/:path*',
        destination: '/:path*',
      },
      {
        source: '/en/:path*',
        destination: '/:path*',
      },
    ];
  },
};

export default nextConfig;
