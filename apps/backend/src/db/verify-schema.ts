import 'dotenv/config';

import { sql } from 'drizzle-orm';

import { getConfig } from '../config.js';
import { createDatabase } from './client.js';

type SchemaResult = {
  jobApplications: string | null;
  sessions: string | null;
  users: string | null;
};

const config = getConfig(process.env);
const { closeConnection, database } = createDatabase(config.databaseUrl);

try {
  const results = await database.execute<SchemaResult>(sql`
    select
      to_regclass('public.users')::text as "users",
      to_regclass('public.sessions')::text as "sessions",
      to_regclass('public.job_applications')::text as "jobApplications"
  `);
  const result = results.at(0);

  if (
    result?.users !== 'users' ||
    result.sessions !== 'sessions' ||
    result.jobApplications !== 'job_applications'
  ) {
    throw new Error('Expected database tables were not found');
  }

  console.log('Database schema verified: users, sessions, job_applications');
} finally {
  await closeConnection();
}
