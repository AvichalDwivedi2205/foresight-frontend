/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ensure dynamic routes work properly
  pageExtensions: ['js', 'jsx', 'ts', 'tsx']
};

module.exports = nextConfig;