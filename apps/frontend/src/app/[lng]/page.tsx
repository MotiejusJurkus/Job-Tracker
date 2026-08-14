import { redirect } from 'next/navigation';

import { getSafeLng } from '@/core/i18n/language';

type Props = {
  params: Promise<{ lng: string }>;
};

const HomePage = async ({ params }: Props) => {
  const { lng } = await params;

  redirect(`/${getSafeLng(lng)}/login`);
};

export default HomePage;
