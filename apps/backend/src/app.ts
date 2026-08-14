import express from "express";

import { createAuthRouter, type Login } from './features/auth/auth.js';
import { createUsersRouter, type CreateUser } from './features/users/users.js';

type Props = {
  createUser?: CreateUser;
  isSecureCookie?: boolean;
  login?: Login;
};

export const createApp = ({ createUser, isSecureCookie, login }: Props = {}) => {
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

  if (login !== undefined) {
    app.use('/auth', createAuthRouter(login, { isSecureCookie }));
  }

  return app;
};

export const app = createApp();
