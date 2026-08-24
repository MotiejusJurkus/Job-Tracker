import type { Database } from "../../db/client.js";
import { sessions, users } from "../../db/schema.js";
import { hashPassword } from "../users/password.js";
import type { CreateUserInput } from "../users/users.js";
import { createSessionCredentials } from "./session.js";

type SignupResult = {
  user: {
    id: string;
    username: string;
  };
  sessionToken: string;
  expiresAt: Date;
};

export type Signup = (input: CreateUserInput) => Promise<SignupResult>;

export const createDatabaseSignup =
  (database: Database): Signup =>
  async (input) => {
    const passwordHash = await hashPassword(input.password);
    const credentials = createSessionCredentials();

    return database.transaction(async (transaction) => {
      const [user] = await transaction
        .insert(users)
        .values({
          username: input.username,
          usernameNormalized: input.username.toLowerCase(),
          passwordHash,
        })
        .returning({
          id: users.id,
          username: users.username,
        });

      if (user === undefined) {
        throw new Error("User insert did not return a row");
      }

      await transaction.insert(sessions).values({
        userId: user.id,
        tokenHash: credentials.tokenHash,
        expiresAt: credentials.expiresAt,
      });

      return {
        user,
        sessionToken: credentials.token,
        expiresAt: credentials.expiresAt,
      };
    });
  };
