import express from "express";

import { createAuthRouter, type Login } from './features/auth/auth.js';
import type { Logout } from './features/auth/logout.js';
import type { AuthenticateSession } from './features/auth/require-auth.js';
import {
  type CreateJobApplication,
  createJobApplicationsRouter,
  type DeleteJobApplication,
  type ListJobApplications,
  type UpdateJobApplication,
} from './features/job-applications/job-applications.js';
import { createUsersRouter, type CreateUser } from './features/users/users.js';

type Props = {
  authenticateSession?: AuthenticateSession;
  createJobApplication?: CreateJobApplication;
  createUser?: CreateUser;
  deleteJobApplication?: DeleteJobApplication;
  isSecureCookie?: boolean;
  listJobApplications?: ListJobApplications;
  login?: Login;
  logout?: Logout;
  updateJobApplication?: UpdateJobApplication;
};

export const createApp = ({
  authenticateSession,
  createJobApplication,
  createUser,
  deleteJobApplication,
  isSecureCookie,
  listJobApplications,
  login,
  logout,
  updateJobApplication,
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
    listJobApplications !== undefined &&
    updateJobApplication !== undefined &&
    deleteJobApplication !== undefined
  ) {
    app.use(
      '/job-applications',
      createJobApplicationsRouter(
        authenticateSession,
        createJobApplication,
        listJobApplications,
        updateJobApplication,
        deleteJobApplication,
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
