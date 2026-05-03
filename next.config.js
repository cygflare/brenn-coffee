/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: '2mb' },
    outputFileTracingIncludes: {
      '/opengraph-image': ['./app/fonts/**'],
      '/product/*/opengraph-image': ['./app/fonts/**'],
    },
  },
};

module.exports = nextConfig;
