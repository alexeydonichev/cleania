import type { NextConfig } from 'next';
import path from 'node:path';

const vercelRuntime = process.env.CLEANIA_RUNTIME === 'vercel' || process.env.VERCEL === '1';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_RUNTIME: vercelRuntime ? 'vercel' : 'sites',
    NEXT_PUBLIC_DEPLOYMENT_MODE: vercelRuntime ? 'preview' : 'live',
  },
  webpack(config, { webpack }) {
    if (vercelRuntime) {
      config.plugins.push(new webpack.NormalModuleReplacementPlugin(
        /^@\/lib\/runtime-env$/,
        path.resolve(process.cwd(), 'lib/vercel-runtime.ts'),
      ));
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
