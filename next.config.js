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


// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: "none-b54",
    project: "javascript-nextjs",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: "/monitoring",

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  }
);
