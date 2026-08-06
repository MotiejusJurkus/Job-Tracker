import { z } from 'zod';

const EnvConfigRaw = {
  ENV: process.env.NEXT_PUBLIC_NODE_ENV,
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  DEFAULT_LANGUAGE: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE,
  SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
};

const EnvConfig = z
  .object({
    ENV: z.literal(['dev', 'prod']),
    SITE_URL: z.url(),
    API_BASE_URL: z.url(),
    DEFAULT_LANGUAGE: z.string().trim().min(2),
    SENTRY_DSN: z.string().optional(),
  })
  .strict()
  .parse(EnvConfigRaw);

export default EnvConfig;
