import { eq } from "drizzle-orm";
import { Router, type RequestHandler, type Response } from "express";
import { z } from "zod";

import type { Database } from "../../db/client.js";
import { sessions, users } from "../../db/schema.js";
import { verifyPassword } from "../users/password.js";
import { createUserSchema, isUniqueViolation } from "../users/users.js";
import type { Logout } from "./logout.js";
import {
  type AuthenticateSession,
  createRequireAuth,
  readSessionToken,
} from "./require-auth.js";
import { createSessionCredentials, SESSION_COOKIE_NAME } from "./session.js";
import type { Signup } from "./signup.js";

const DUMMY_PASSWORD_HASH = `scrypt:${Buffer.alloc(16).toString("base64")}:${Buffer.alloc(64).toString("base64")}`;

const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(1).max(128),
});

type LoginInput = z.infer<typeof loginSchema>;

type LoginResult = {
  user: {
    id: string;
    username: string;
  };
  sessionToken: string;
  expiresAt: Date;
};

type RouterOptions = {
  isSecureCookie?: boolean;
  loginRateLimiter?: RequestHandler;
  signupRateLimiter?: RequestHandler;
};

export type Login = (input: LoginInput) => Promise<LoginResult | undefined>;

export const createDatabaseLogin =
  (database: Database): Login =>
  async (input) => {
    const [user] = await database
      .select({
        id: users.id,
        username: users.username,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.usernameNormalized, input.username.toLowerCase()))
      .limit(1);

    const passwordHash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
    const isPasswordValid = await verifyPassword(input.password, passwordHash);

    if (user === undefined || !isPasswordValid) {
      return undefined;
    }

    const credentials = createSessionCredentials();

    await database.insert(sessions).values({
      userId: user.id,
      tokenHash: credentials.tokenHash,
      expiresAt: credentials.expiresAt,
    });

    return {
      user: {
        id: user.id,
        username: user.username,
      },
      sessionToken: credentials.token,
      expiresAt: credentials.expiresAt,
    };
  };

export const createAuthRouter = (
  login: Login | undefined,
  signup: Signup | undefined,
  authenticateSession: AuthenticateSession | undefined,
  logout: Logout | undefined,
  {
    isSecureCookie = false,
    loginRateLimiter,
    signupRateLimiter,
  }: RouterOptions = {},
): Router => {
  const router = Router();

  const setSessionCookie = (
    response: Response,
    sessionToken: string,
    expiresAt: Date,
  ) => {
    response.cookie(SESSION_COOKIE_NAME, sessionToken, {
      expires: expiresAt,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: isSecureCookie,
    });
  };

  if (signup !== undefined) {
    router.post(
      "/signup",
      signupRateLimiter ?? ((_request, _response, next) => next()),
      async (request, response) => {
        response.set("Cache-Control", "no-store");

        const input = createUserSchema.safeParse(request.body);

        if (!input.success) {
          response.status(400).json({
            error: "Invalid username or password",
            details: z.flattenError(input.error).fieldErrors,
          });
          return;
        }

        try {
          const result = await signup(input.data);

          setSessionCookie(response, result.sessionToken, result.expiresAt);
          response.status(201).json({ user: result.user });
        } catch (error) {
          if (isUniqueViolation(error)) {
            response.status(409).json({ error: "Username is already taken" });
            return;
          }

          response.status(500).json({ error: "Unable to create account" });
        }
      },
    );
  }

  if (login !== undefined) {
    router.post(
      "/login",
      loginRateLimiter ?? ((_request, _response, next) => next()),
      async (request, response) => {
        response.set("Cache-Control", "no-store");

        const input = loginSchema.safeParse(request.body);

        if (!input.success) {
          response.status(400).json({ error: "Invalid login request" });
          return;
        }

        try {
          const result = await login(input.data);

          if (result === undefined) {
            response
              .status(401)
              .json({ error: "Invalid username or password" });
            return;
          }

          setSessionCookie(response, result.sessionToken, result.expiresAt);
          response.status(200).json({ user: result.user });
        } catch {
          response.status(500).json({ error: "Unable to log in" });
        }
      },
    );
  }

  if (authenticateSession !== undefined) {
    router.get(
      "/session",
      createRequireAuth(authenticateSession),
      (_request, response) => {
        const user = response.locals.user;

        if (user === undefined) {
          response
            .status(500)
            .json({ error: "Unable to authenticate session" });
          return;
        }

        response.status(200).json({ user });
      },
    );
  }

  if (logout !== undefined) {
    router.post("/logout", async (request, response) => {
      response.set("Cache-Control", "no-store");

      const token = readSessionToken(request.headers.cookie);

      try {
        if (token !== undefined) {
          await logout(token);
        }

        response.clearCookie(SESSION_COOKIE_NAME, {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secure: isSecureCookie,
        });
        response.status(204).end();
      } catch {
        response.status(500).json({ error: "Unable to log out" });
      }
    });
  }

  return router;
};
