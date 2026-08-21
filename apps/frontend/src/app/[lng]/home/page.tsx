import { getTranslations } from '@/core/i18n/get-translations';
import { getSafeLng } from '@/core/i18n/language';
import { LogoutButton } from '@/features/auth/components/LogoutButton';
import { AddJobApplicationModal } from '@/features/job-applications/components/AddJobApplicationModal';

type Props = {
  params: Promise<{ lng: string }>;
};

const HomePage = async ({ params }: Props) => {
  const { lng } = await params;
  const safeLng = getSafeLng(lng);
  const t = getTranslations(safeLng);

  return (
    <main className="min-h-screen bg-muted px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl flex-col">
        <header className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{t.msg_job_application_page_title}</h1>
            <p className="mt-2 text-muted-foreground">{t.msg_job_application_page_subtitle}</p>
          </div>
          <LogoutButton />
        </header>

        <section className="flex flex-1 items-center justify-center py-12">
          <AddJobApplicationModal />
        </section>
      </div>
    </main>
  );
};

export default HomePage;
