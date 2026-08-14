import type { AuthenticatedUser } from '../features/auth/require-auth.js';

declare global {
  namespace Express {
    interface Locals {
      user?: AuthenticatedUser;
    }
  }
}

export {};
