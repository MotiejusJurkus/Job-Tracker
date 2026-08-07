import { isAxiosError } from 'axios';
import { z } from 'zod';

import { publicApi } from '@/core/utils/api';

const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  createdAt: z.iso.datetime(),
});

const createUserResponseSchema = z.object({ user: userSchema });
const errorResponseSchema = z.object({ error: z.string() });

export type CreateUserInput = {
  username: string;
  password: string;
};

export const createUser = async (input: CreateUserInput) => {
  try {
    const { data } = await publicApi.post<unknown>('/users', input);

    return createUserResponseSchema.parse(data).user;
  } catch (error) {
    if (isAxiosError(error)) {
      const result = errorResponseSchema.safeParse(error.response?.data);

      if (result.success) {
        throw new Error(result.data.error);
      }
    }

    throw error;
  }
};
