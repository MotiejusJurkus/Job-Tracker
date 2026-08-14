import { createHash, randomBytes } from 'node:crypto';

export const SESSION_COOKIE_NAME = 'session';

const SESSION_TOKEN_BYTES = 32;
const SESSION_LIFETIME_DAYS = 30;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

type SessionCredentials = {
  token: string;
  tokenHash: string;
  expiresAt: Date;
};

export const hashSessionToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

export const createSessionCredentials = (
  now = new Date(),
): SessionCredentials => {
  const token = randomBytes(SESSION_TOKEN_BYTES).toString('base64url');
  const expiresAt = new Date(
    now.getTime() + SESSION_LIFETIME_DAYS * MILLISECONDS_PER_DAY,
  );

  return {
    token,
    tokenHash: hashSessionToken(token),
    expiresAt,
  };
};
