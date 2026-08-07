import { getTranslations } from '@/core/i18n/get-translations';
import { getSafeLng } from '@/core/i18n/language';
import { CreateUserForm } from '@/features/users/components/CreateUserForm';

type Props = {
  params: Promise<{ lng: string }>;
};

const HomePage = async ({ params }: Props) => {
  const { lng } = await params;
  const t = getTranslations(getSafeLng(lng));

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-6 py-12">
      <section className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <header className="mb-8 space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{t.msg_create_user_title}</h1>
          <p className="text-sm text-muted-foreground">{t.msg_create_user_subtitle}</p>
        </header>

        <CreateUserForm />
      </section>
    </main>
  );
};

export default HomePage;
