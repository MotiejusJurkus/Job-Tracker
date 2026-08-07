import express from "express";

import { createUsersRouter, type CreateUser } from './features/users/users.js';

type Props = {
  createUser?: CreateUser;
};

export const createApp = ({ createUser }: Props = {}) => {
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

  return app;
};

export const app = createApp();
