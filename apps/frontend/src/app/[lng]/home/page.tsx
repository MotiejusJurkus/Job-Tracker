import { cookies } from 'next/headers';

import { getTranslations } from '@/core/i18n/get-translations';
import { getSafeLng } from '@/core/i18n/language';
import { LogoutButton } from '@/features/auth/components/LogoutButton';
import { AddJobApplicationButton } from '@/features/job-applications/components/AddJobApplicationButton';
import { JobApplicationsList } from '@/features/job-applications/components/JobApplicationsList';
import { listJobApplications } from '@/features/job-applications/job-applications';

type Props = {
  params: Promise<{ lng: string }>;
};

const HomePage = async ({ params }: Props) => {
  const { lng } = await params;
  const safeLng = getSafeLng(lng);
  const t = getTranslations(safeLng);
  const cookieStore = await cookies();
  const applications = await listJobApplications(cookieStore.toString());

  return (
    <main className="min-h-screen bg-muted px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex flex-col gap-6 border-b pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{t.msg_job_application_page_title}</h1>
            <p className="mt-2 text-muted-foreground">{t.msg_job_application_page_subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <AddJobApplicationButton />
            <LogoutButton />
          </div>
        </header>

        <section className="py-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">{t.msg_job_application_saved_title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.msg_job_application_saved_count.replace('{{count}}', String(applications.length))}
              </p>
            </div>
          </div>
          <JobApplicationsList applications={applications} lng={safeLng} />
        </section>
      </div>
    </main>
  );
};

export default HomePage;
