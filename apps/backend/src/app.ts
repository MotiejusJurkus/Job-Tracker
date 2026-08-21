import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";

import { createAuthRouter, type Login } from "./features/auth/auth.js";
import type { Logout } from "./features/auth/logout.js";
import type { AuthenticateSession } from "./features/auth/require-auth.js";
import {
  type CreateJobApplication,
  createJobApplicationsRouter,
  type DeleteJobApplication,
  type ListJobApplications,
  type UpdateJobApplication,
} from "./features/job-applications/job-applications.js";
import { createUsersRouter, type CreateUser } from "./features/users/users.js";
import { createRequireTrustedOrigin } from "./security.js";

const DEFAULT_FRONTEND_ORIGIN = "http://localhost:3000";
const JSON_BODY_LIMIT = "100kb";
const AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1_000;
const LOGIN_RATE_LIMIT_MAX = 20;
const SIGNUP_RATE_LIMIT_MAX = 10;

const isEntityTooLarge = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "status" in error &&
  error.status === 413;

type Props = {
  authenticateSession?: AuthenticateSession;
  createJobApplication?: CreateJobApplication;
  createUser?: CreateUser;
  deleteJobApplication?: DeleteJobApplication;
  frontendOrigin?: string;
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
  frontendOrigin = DEFAULT_FRONTEND_ORIGIN,
  isSecureCookie,
  listJobApplications,
  login,
  logout,
  updateJobApplication,
}: Props = {}) => {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ credentials: true, origin: frontendOrigin }));
  app.use(express.json({ limit: JSON_BODY_LIMIT }));
  app.use(createRequireTrustedOrigin(frontendOrigin));

  app.get("/health", (_request, response) => {
    response.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });

  if (createUser !== undefined) {
    app.use(
      "/users",
      rateLimit({
        windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
        limit: SIGNUP_RATE_LIMIT_MAX,
        standardHeaders: "draft-8",
        legacyHeaders: false,
      }),
      createUsersRouter(createUser),
    );
  }

  if (
    authenticateSession !== undefined &&
    createJobApplication !== undefined &&
    listJobApplications !== undefined &&
    updateJobApplication !== undefined &&
    deleteJobApplication !== undefined
  ) {
    app.use(
      "/job-applications",
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
      "/auth",
      createAuthRouter(login, authenticateSession, logout, {
        isSecureCookie,
        loginRateLimiter: rateLimit({
          windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
          limit: LOGIN_RATE_LIMIT_MAX,
          standardHeaders: "draft-8",
          legacyHeaders: false,
        }),
      }),
    );
  }

  const handleError: ErrorRequestHandler = (
    error,
    _request,
    response,
    next,
  ) => {
    if (response.headersSent) {
      next(error);
      return;
    }

    if (isEntityTooLarge(error)) {
      response.status(413).json({ error: "Request body is too large" });
      return;
    }

    next(error);
  };

  app.use(handleError);

  return app;
};

export const app = createApp();
