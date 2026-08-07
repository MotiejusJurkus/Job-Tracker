import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema.js';

const MAX_CONNECTIONS = 5;
const IDLE_TIMEOUT_SECONDS = 20;
const CONNECT_TIMEOUT_SECONDS = 10;

export const createDatabase = (databaseUrl: string) => {
  const sql = postgres(databaseUrl, {
    max: MAX_CONNECTIONS,
    idle_timeout: IDLE_TIMEOUT_SECONDS,
    connect_timeout: CONNECT_TIMEOUT_SECONDS,
    prepare: false,
  });

  const database = drizzle(sql, { schema });

  const checkConnection = async (): Promise<void> => {
    await sql`select 1`;
  };

  const closeConnection = async (): Promise<void> => {
    await sql.end();
  };

  return {
    database,
    checkConnection,
    closeConnection,
  };
};

export type Database = ReturnType<typeof createDatabase>['database'];
