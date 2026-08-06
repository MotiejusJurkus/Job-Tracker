'use client';

import { useQuery } from '@tanstack/react-query';

import { useTranslation } from '@/core/i18n/use-translation';

import { postsQueries } from '../posts';

export const PostsList = () => {
  const { t } = useTranslation();
  const { data, isPending, isError } = useQuery(postsQueries.list());

  if (isPending) {
    return <p className="text-muted-foreground">{t('msg_posts_loading')}</p>;
  }

  if (isError) {
    return <p className="text-destructive">{t('msg_posts_error')}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {data.map((post) => (
        <li key={post.id} className="rounded-lg border p-4">
          <h3 className="font-medium capitalize">{post.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{post.body}</p>
        </li>
      ))}
    </ul>
  );
};
