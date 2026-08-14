import Link from 'next/link';

import { getTranslations } from '@/core/i18n/get-translations';
import { getSafeLng } from '@/core/i18n/language';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { CreateUserForm } from '@/features/users/components/CreateUserForm';

type Props = {
  params: Promise<{ lng: string }>;
};

const SignupPage = async ({ params }: Props) => {
  const { lng } = await params;
  const safeLng = getSafeLng(lng);
  const t = getTranslations(safeLng);

  return (
    <AuthCard
      title={t.msg_signup_title}
      subtitle={t.msg_signup_subtitle}
      footer={
        <>
          {t.msg_signup_has_account}{' '}
          <Link className="font-medium text-primary hover:underline" href={`/${safeLng}/login`}>
            {t.msg_signup_login_link}
          </Link>
        </>
      }
    >
      <CreateUserForm />
    </AuthCard>
  );
};

export default SignupPage;
