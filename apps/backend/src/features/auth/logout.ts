import { eq } from 'drizzle-orm';

import type { Database } from '../../db/client.js';
import { sessions } from '../../db/schema.js';
import { hashSessionToken } from './session.js';

export type Logout = (token: string) => Promise<void>;

export const createDatabaseLogout = (database: Database): Logout => async (token) => {
  await database
    .delete(sessions)
    .where(eq(sessions.tokenHash, hashSessionToken(token)));
};
