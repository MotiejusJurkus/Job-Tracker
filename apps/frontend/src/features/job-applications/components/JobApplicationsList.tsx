import { getTranslations } from '@/core/i18n/get-translations';
import type { Language } from '@/core/i18n/language';

import type { JobApplication } from '../job-applications';

import { JobApplicationListItem } from './JobApplicationListItem';

type Props = {
  applications: JobApplication[];
  lng: Language;
};

export const JobApplicationsList = ({ applications, lng }: Props) => {
  const t = getTranslations(lng);

  if (applications.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card px-6 py-16 text-center">
        <h2 className="text-lg font-semibold">{t.msg_job_application_empty_title}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{t.msg_job_application_empty_description}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(7rem,0.8fr)_minmax(7rem,0.8fr)] gap-6 border-b bg-muted/50 px-6 py-3 text-xs font-medium tracking-wide text-muted-foreground uppercase md:grid">
        <span>{t.msg_job_application_company}</span>
        <span>{t.msg_job_application_position}</span>
        <span>{t.msg_job_application_status}</span>
        <span>{t.msg_job_application_applied_at}</span>
      </div>

      <ul className="divide-y">
        {applications.map((application) => (
          <JobApplicationListItem key={application.id} application={application} />
        ))}
      </ul>
    </div>
  );
};
