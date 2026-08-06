import { queryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';

// Public demo endpoint — swap for your own `api` client (see src/core/utils/api.ts).
const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts';
const POSTS_LIMIT = 5;

const postSchema = z.object({
  id: z.number(),
  title: z.string(),
  body: z.string(),
});

const postsSchema = z.array(postSchema);

export type Post = z.infer<typeof postSchema>;

const getPosts = async (): Promise<Post[]> => {
  const { data } = await axios.get<unknown>(POSTS_URL);

  return postsSchema.parse(data).slice(0, POSTS_LIMIT);
};

export const postsQueries = {
  all: () => ['posts'] as const,
  list: () =>
    queryOptions({
      queryKey: [...postsQueries.all(), 'list'],
      queryFn: getPosts,
    }),
};
