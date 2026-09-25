/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['sql.js', 'pg'],
    outputFileTracingIncludes: {
      '/**': ['./database.sqlite', './public/database.sqlite'],
      '/*': ['./database.sqlite', './public/database.sqlite'],
      '/[slug]': ['./database.sqlite', './public/database.sqlite'],
      '/mover/[slug]': ['./database.sqlite', './public/database.sqlite'],
      '/api/**': ['./database.sqlite', './public/database.sqlite'],
      '/admin/**': ['./database.sqlite', './public/database.sqlite'],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;

