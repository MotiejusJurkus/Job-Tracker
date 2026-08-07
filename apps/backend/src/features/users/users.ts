import { Router } from 'express';
import { z } from 'zod';

import type { Database } from '../../db/client.js';
import { users } from '../../db/schema.js';
import { hashPassword } from './password.js';

const createUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8).max(128),
});

type CreateUserInput = z.infer<typeof createUserSchema>;

type UserResponse = {
  id: string;
  username: string;
  createdAt: Date;
};

export type CreateUser = (input: CreateUserInput) => Promise<UserResponse>;

export const createDatabaseUser = async (
  database: Database,
  input: CreateUserInput,
): Promise<UserResponse> => {
  const passwordHash = await hashPassword(input.password);
  const [user] = await database
    .insert(users)
    .values({
      username: input.username,
      usernameNormalized: input.username.toLowerCase(),
      passwordHash,
    })
    .returning({
      id: users.id,
      username: users.username,
      createdAt: users.createdAt,
    });

  if (user === undefined) {
    throw new Error('User insert did not return a row');
  }

  return user;
};

const isUniqueViolation = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === '23505';

export const createUsersRouter = (createUser: CreateUser): Router => {
  const router = Router();

  router.post('/', async (request, response) => {
    const result = createUserSchema.safeParse(request.body);

    if (!result.success) {
      response.status(400).json({
        error: 'Invalid username or password',
        details: z.flattenError(result.error).fieldErrors,
      });
      return;
    }

    try {
      const user = await createUser(result.data);
      response.status(201).json({ user });
    } catch (error) {
      if (isUniqueViolation(error)) {
        response.status(409).json({ error: 'Username is already taken' });
        return;
      }

      response.status(500).json({ error: 'Unable to create user' });
    }
  });

  return router;
};
