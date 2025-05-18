import { Configuration as WebpackConfig } from 'webpack';
import { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ensure dynamic routes work properly
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // Optimize for framer-motion and chunks
  transpilePackages: ['framer-motion'],
  webpack: (config: WebpackConfig): WebpackConfig => {
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
