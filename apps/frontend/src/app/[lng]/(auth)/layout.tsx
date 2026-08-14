import type { PropsWithChildren } from 'react';

const AuthLayout = ({ children }: PropsWithChildren) => (
  <main className="flex min-h-screen items-center justify-center bg-muted px-6 py-12">{children}</main>
);

export default AuthLayout;
