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
    serverComponentsExternalPackages: ['sql.js', 'pg'],
    outputFileTracingIncludes: {
      '/*': ['./database.sqlite'],
    },
  },
};

module.exports = nextConfig;
