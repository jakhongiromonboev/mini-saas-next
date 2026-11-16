import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const apiTarget = process.env.API_PROXY_TARGET?.replace(/\/+$/, '');

    if (!apiTarget) return [];

    // Forward API requests through the frontend origin for cookie authentication.
    return [
      {
        source: '/api/:path*',
        destination: `${apiTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
