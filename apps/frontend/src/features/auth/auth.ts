import { isAxiosError } from 'axios';
import { z } from 'zod';

import { publicApi } from '@/core/utils/api';

export type LoginInput = {
  username: string;
  password: string;
};

const loginResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    username: z.string(),
  }),
});

const errorResponseSchema = z.object({ error: z.string() });

export const login = async (input: LoginInput) => {
  try {
    const { data } = await publicApi.post<unknown>('/auth/login', input);

    return loginResponseSchema.parse(data).user;
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

export const logout = async () => {
  await publicApi.post('/auth/logout');
};
