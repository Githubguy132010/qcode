const path = require('path');
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
  ],
  buildExcludes: [/middleware-manifest\.json$/],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack configuration
  // Note: Most Turbopack settings are now automatically configured
  // and don't need explicit configuration
  
  // Webpack configuration for production builds
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      // Enable persistent caching in production - COMMENTED OUT TO PREVENT CACHE CORRUPTION
      // config.cache = {
      //   type: 'filesystem',
      //   buildDependencies: {
      //     config: [__filename],
      //   },
      //   cacheDirectory: path.join(process.cwd(), '.next', 'cache', 'webpack'),
      //   name: 'webpack',
      // };
    }

    // Resolve Mini CSS Extract Plugin warning - COMMENTED OUT TO PREVENT CACHE ISSUES
    // config.plugins.forEach(plugin => {
    //   if (plugin.constructor.name === 'MiniCssExtractPlugin') {
    //     plugin.options.ignoreOrder = true;
    //   }
    // });
    return config;
  }
}

module.exports = withPWA(nextConfig)
