import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  reactStrictMode: true,
  output: 'standalone',

  turbopack: {
    rules: {
      '*.svg': {
        loaders: [
          {
            loader: '@svgr/webpack',
            options: { icon: true, typescript: true, ext: 'tsx' },
          },
        ],
        as: '*.js',
      },
    },
  },

  images: {
    remotePatterns: [
      // Add per-project remote image hosts here
    ],
  },
};

// Optionally wrap with Sentry only when a DSN is configured, so the template
// runs cleanly without any Sentry setup. Enable by setting NEXT_PUBLIC_SENTRY_DSN.
const buildConfig = async (): Promise<NextConfig> => {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return nextConfig;
  }

  const { withSentryConfig } = await import('@sentry/nextjs');

  return withSentryConfig(nextConfig, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    silent: !process.env.CI,
    widenClientFileUpload: true,
    disableLogger: true,
  });
};

export default buildConfig;
