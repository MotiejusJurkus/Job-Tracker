import Link from 'next/link';

import { getTranslations } from '@/core/i18n/get-translations';
import { getSafeLng } from '@/core/i18n/language';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { LoginForm } from '@/features/auth/components/LoginForm';

type Props = {
  params: Promise<{ lng: string }>;
};

const LoginPage = async ({ params }: Props) => {
  const { lng } = await params;
  const safeLng = getSafeLng(lng);
  const t = getTranslations(safeLng);

  return (
    <AuthCard
      title={t.msg_login_title}
      subtitle={t.msg_login_subtitle}
      footer={
        <>
          {t.msg_login_no_account}{' '}
          <Link className="font-medium text-primary hover:underline" href={`/${safeLng}/signup`}>
            {t.msg_login_signup_link}
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthCard>
  );
};

export default LoginPage;
