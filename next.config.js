/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/city/:slug',
        destination: '/:slug',
      },
      {
        source: '/state/:slug',
        destination: '/:slug',
      },
      {
        source: '/packers-and-movers/:slug',
        destination: '/packers-and-movers-:slug',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/cities',
        destination: '/top-packers-and-movers',
        permanent: false,
      },
      {
        source: '/states',
        destination: '/top-packers-and-movers',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
