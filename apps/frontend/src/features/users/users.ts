import { isAxiosError } from 'axios';
import { z } from 'zod';

import { publicApi } from '@/core/utils/api';

import type { CreateUserInput } from './schema';

const userSchema = z.object({
  id: z.string(),
  username: z.string(),
});

const signupResponseSchema = z.object({ user: userSchema });
const errorResponseSchema = z.object({ error: z.string() });

export const signup = async (input: CreateUserInput) => {
  try {
    const { data } = await publicApi.post<unknown>('/auth/signup', input);

    return signupResponseSchema.parse(data).user;
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
