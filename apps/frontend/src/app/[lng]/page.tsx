import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getSafeLng } from '@/core/i18n/language';
import { getSessionUser } from '@/features/auth/auth-server';

type Props = {
  params: Promise<{ lng: string }>;
};

const HomePage = async ({ params }: Props) => {
  const { lng } = await params;
  const safeLng = getSafeLng(lng);
  const cookieStore = await cookies();
  const user = await getSessionUser(cookieStore.toString());

  redirect(`/${safeLng}/${user === undefined ? 'login' : 'home'}`);
};

export default HomePage;
