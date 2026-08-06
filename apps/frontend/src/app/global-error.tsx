'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

import { Button } from '@/core/components/ui/button';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

const GlobalError = ({ error, reset }: Props) => {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="max-w-md text-muted-foreground">An unexpected error occurred. Please try again.</p>
          <Button onClick={() => reset()}>Try again</Button>
        </main>
      </body>
    </html>
  );
};

export default GlobalError;
