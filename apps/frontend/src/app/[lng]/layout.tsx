import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import type { PropsWithChildren } from 'react';

import { Providers } from '@/app/providers';
import { getTranslations } from '@/core/i18n/get-translations';
import { getSafeLng, LANGUAGES } from '@/core/i18n/language';

import 'react-toastify/dist/ReactToastify.css';
import '../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Next.js Starter Template',
  description: 'A lean Next.js App Router + TypeScript starter.',
};

export const generateStaticParams = () => LANGUAGES.map((lng) => ({ lng }));

type Props = PropsWithChildren<{
  params: Promise<{ lng: string }>;
}>;

const RootLayout = async ({ children, params }: Props) => {
  const { lng } = await params;
  const safeLng = getSafeLng(lng);
  const translations = getTranslations(safeLng);

  return (
    <html lang={safeLng}>
      <body className={`${geistSans.variable} antialiased`}>
        <Providers lng={safeLng} translations={translations}>
          {children}
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
