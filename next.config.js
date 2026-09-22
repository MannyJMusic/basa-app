const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  // sanitize-html's parser chain ships ESM only. Next handles that in its own
  // bundle, but next/jest builds jest's transformIgnorePatterns from this list, so
  // without it every test that imports src/lib/sanitize-html.ts fails to parse.
  transpilePackages: [
    "sanitize-html",
    "htmlparser2",
    "domhandler",
    "domutils",
    "domelementtype",
    "dom-serializer",
    "entities",
  ],
  // The image optimizer fetches whatever url= names and hands it to sharp, so
  // the allowed sources must be a closed list (2026-09-22 audit: a wildcard here
  // exposed GHSA-2xp9-vwfh-vxw4 on Next < 15.5.24). Add hosts deliberately.
  images: {
    formats: ["image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "app.businessassociationsa.com" },
      { protocol: "https", hostname: "businessassociationsa.com" },
      { protocol: "https", hostname: "www.businessassociationsa.com" },
      // Google account avatars for OAuth users
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  // No `env:` block. NextAuth reads NEXTAUTH_URL / NEXTAUTH_SECRET from the
  // runtime environment; inlining them here compiled the secret into every
  // image layer (2026-09-22 audit), which is why rotating the env file alone
  // did not rotate it.
  poweredByHeader: false,
  // Allow development origins for HMR
  allowedDevOrigins: [
    'dev.businessassociationsa.com',
    'localhost:3000',
    'localhost:3001'
  ],

  // Configure webpack for better HMR support
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Enable HMR for development
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  }
};

// Sentry configuration
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG || "basa-0f",
  project: process.env.SENTRY_PROJECT || "basa-v3",

  // Source-map upload. Read from .env.production during the image build on the
  // host; an empty value means "build without uploading", not a failed build.
  authToken: process.env.SENTRY_AUTH_TOKEN,

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
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
