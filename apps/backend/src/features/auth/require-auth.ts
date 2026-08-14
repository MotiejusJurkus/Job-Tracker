import { and, eq, gt } from 'drizzle-orm';
import type { RequestHandler } from 'express';

import type { Database } from '../../db/client.js';
import { sessions, users } from '../../db/schema.js';
import { hashSessionToken, SESSION_COOKIE_NAME } from './session.js';

const SESSION_TOKEN_LENGTH = 43;
const SESSION_TOKEN_PATTERN = /^[A-Za-z0-9_-]+$/;

export type AuthenticatedUser = {
  id: string;
  username: string;
};

export type AuthenticateSession = (
  token: string,
) => Promise<AuthenticatedUser | undefined>;

export const readSessionToken = (
  cookieHeader: string | undefined,
): string | undefined => {
  if (cookieHeader === undefined) {
    return undefined;
  }

  const sessionCookies = cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .filter((cookie) => cookie.startsWith(`${SESSION_COOKIE_NAME}=`));

  if (sessionCookies.length !== 1) {
    return undefined;
  }

  const token = sessionCookies.at(0)?.slice(SESSION_COOKIE_NAME.length + 1);

  if (
    token === undefined ||
    token.length !== SESSION_TOKEN_LENGTH ||
    !SESSION_TOKEN_PATTERN.test(token)
  ) {
    return undefined;
  }

  return token;
};

export const createDatabaseAuthenticateSession = (
  database: Database,
): AuthenticateSession =>
  async (token) => {
    const [user] = await database
      .select({
        id: users.id,
        username: users.username,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(
        and(
          eq(sessions.tokenHash, hashSessionToken(token)),
          gt(sessions.expiresAt, new Date()),
        ),
      )
      .limit(1);

    return user;
  };

export const createRequireAuth = (
  authenticateSession: AuthenticateSession,
): RequestHandler =>
  async (request, response, next) => {
    response.set('Cache-Control', 'no-store');

    const token = readSessionToken(request.headers.cookie);

    if (token === undefined) {
      response.status(401).json({ error: 'Authentication required' });
      return;
    }

    try {
      const user = await authenticateSession(token);

      if (user === undefined) {
        response.status(401).json({ error: 'Authentication required' });
        return;
      }

      response.locals.user = user;
      next();
    } catch {
      response.status(500).json({ error: 'Unable to authenticate session' });
    }
  };
