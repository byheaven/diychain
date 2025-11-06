/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  transpilePackages: ['three'],
  // basePath is only needed if not using custom domain
  // basePath: '/diychain',
  // assetPrefix: '/diychain/',
}

module.exports = nextConfig
