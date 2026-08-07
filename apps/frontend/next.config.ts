import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  reactStrictMode: true,
  output: 'standalone',

  rewrites: () =>
    Promise.resolve([
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/:path*`,
      },
    ]),

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
};

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
