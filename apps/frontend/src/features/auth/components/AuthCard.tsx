import type { PropsWithChildren, ReactNode } from 'react';

type Props = PropsWithChildren<{
  title: string;
  subtitle: string;
  footer: ReactNode;
}>;

export const AuthCard = ({ children, footer, subtitle, title }: Props) => (
  <section className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
    <header className="mb-8 space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </header>

    {children}

    <footer className="mt-6 border-t pt-6 text-center text-sm text-muted-foreground">{footer}</footer>
  </section>
);
