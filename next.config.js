/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ensure dynamic routes work properly
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // Optimize for framer-motion and chunks
  transpilePackages: ['framer-motion'],
  webpack: (config) => {
    // Prevent chunk loading issues
    if (config.optimization && config.optimization.splitChunks) {
      config.optimization.splitChunks = {
        ...(config.optimization.splitChunks || {}),
        cacheGroups: {
          ...(config.optimization.splitChunks.cacheGroups || {}),
          // Ensure framer-motion is bundled properly
          framerMotion: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'framer-motion',
            chunks: 'all',
            priority: 10
          }
        }
      };
    }
    return config;
  }
};

module.exports = nextConfig;
