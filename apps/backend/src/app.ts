import express from "express";

import { createAuthRouter, type Login } from './features/auth/auth.js';
import type { AuthenticateSession } from './features/auth/require-auth.js';
import { createUsersRouter, type CreateUser } from './features/users/users.js';

type Props = {
  authenticateSession?: AuthenticateSession;
  createUser?: CreateUser;
  isSecureCookie?: boolean;
  login?: Login;
};

export const createApp = ({
  authenticateSession,
  createUser,
  isSecureCookie,
  login,
}: Props = {}) => {
  const app = express();

  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });

  if (createUser !== undefined) {
    app.use('/users', createUsersRouter(createUser));
  }

  if (login !== undefined || authenticateSession !== undefined) {
    app.use(
      '/auth',
      createAuthRouter(login, authenticateSession, { isSecureCookie }),
    );
  }

  return app;
};

export const app = createApp();
