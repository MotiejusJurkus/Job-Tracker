import express from "express";

import { createAuthRouter, type Login } from './features/auth/auth.js';
import type { Logout } from './features/auth/logout.js';
import type { AuthenticateSession } from './features/auth/require-auth.js';
import {
  type CreateJobApplication,
  createJobApplicationsRouter,
  type ListJobApplications,
} from './features/job-applications/job-applications.js';
import { createUsersRouter, type CreateUser } from './features/users/users.js';

type Props = {
  authenticateSession?: AuthenticateSession;
  createJobApplication?: CreateJobApplication;
  createUser?: CreateUser;
  isSecureCookie?: boolean;
  listJobApplications?: ListJobApplications;
  login?: Login;
  logout?: Logout;
};

export const createApp = ({
  authenticateSession,
  createJobApplication,
  createUser,
  isSecureCookie,
  listJobApplications,
  login,
  logout,
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

  if (
    authenticateSession !== undefined &&
    createJobApplication !== undefined &&
    listJobApplications !== undefined
  ) {
    app.use(
      '/job-applications',
      createJobApplicationsRouter(
        authenticateSession,
        createJobApplication,
        listJobApplications,
      ),
    );
  }

  if (
    login !== undefined ||
    authenticateSession !== undefined ||
    logout !== undefined
  ) {
    app.use(
      '/auth',
      createAuthRouter(login, authenticateSession, logout, { isSecureCookie }),
    );
  }

  return app;
};

export const app = createApp();
