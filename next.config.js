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
  experimental: {
    serverComponentsExternalPackages: ['sqlite3', 'pg'],
    outputFileTracingIncludes: {
      '/*': ['./database.sqlite'],
    },
  },
};

module.exports = nextConfig;
