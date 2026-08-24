import { z } from 'zod';

const sessionResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    username: z.string(),
  }),
});

export const getSessionUser = async (cookieHeader: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/session`, {
    headers: { cookie: cookieHeader },
    cache: 'no-store',
  });

  if (response.status === 401) {
    return undefined;
  }

  if (!response.ok) {
    throw new Error('Unable to verify authentication');
  }

  const data: unknown = await response.json();

  return sessionResponseSchema.parse(data).user;
};
