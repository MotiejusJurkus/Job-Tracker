import 'dotenv/config';

import { defineConfig } from 'drizzle-kit';

import { getDatabaseUrl } from './src/config.js';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: getDatabaseUrl(process.env.DATABASE_URL),
  },
  strict: true,
  verbose: true,
});
