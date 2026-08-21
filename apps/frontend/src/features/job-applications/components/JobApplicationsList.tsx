import { getTranslations } from '@/core/i18n/get-translations';
import type { Language } from '@/core/i18n/language';

import type { JobApplication } from '../job-applications';

type Props = {
  applications: JobApplication[];
  lng: Language;
};

const statusLabels = {
  wishlist: 'msg_job_application_status_wishlist',
  applied: 'msg_job_application_status_applied',
  interviewing: 'msg_job_application_status_interviewing',
  offer: 'msg_job_application_status_offer',
  rejected: 'msg_job_application_status_rejected',
  withdrawn: 'msg_job_application_status_withdrawn',
} as const;

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
          <li
            key={application.id}
            className="grid gap-3 px-5 py-5 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(7rem,0.8fr)_minmax(7rem,0.8fr)] md:items-center md:gap-6 md:px-6"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{application.companyName}</p>
              {application.jobUrl && (
                <a
                  className="mt-1 inline-block text-sm text-primary hover:underline"
                  href={application.jobUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t.msg_job_application_view_posting}
                </a>
              )}
            </div>
            <p className="min-w-0 truncate text-sm md:text-base">{application.positionTitle}</p>
            <div>
              <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                {t[statusLabels[application.status]]}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {application.appliedAt ?? t.msg_job_application_date_not_set}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};
