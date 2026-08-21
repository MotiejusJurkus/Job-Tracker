'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/core/components/ui/button';
import { useModal } from '@/core/context/ModalProvider';
import { useTranslation } from '@/core/i18n/use-translation';

import { deleteJobApplication, type JobApplication } from '../job-applications';

import { CreateJobApplicationForm } from './CreateJobApplicationForm';

type Props = {
  application: JobApplication;
};

type EditProps = Props & {
  onBack: () => void;
  onSuccess: () => void;
};

const statusLabels = {
  wishlist: 'msg_job_application_status_wishlist',
  applied: 'msg_job_application_status_applied',
  interviewing: 'msg_job_application_status_interviewing',
  offer: 'msg_job_application_status_offer',
  rejected: 'msg_job_application_status_rejected',
  withdrawn: 'msg_job_application_status_withdrawn',
} as const;

const Detail = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="space-y-1">
    <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
    <dd className="text-sm break-words">{value}</dd>
  </div>
);

const DeleteJobApplicationConfirmation = ({ application }: Props) => {
  const { t } = useTranslation();
  const { closeModal } = useModal();
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setError(undefined);
    setIsDeleting(true);

    try {
      await deleteJobApplication(application.id);
      closeModal();
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : t('msg_job_application_delete_error'));
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        {t('msg_job_application_delete_confirmation').replace('{{company}}', application.companyName)}
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={closeModal}>
          {t('msg_job_application_delete_cancel')}
        </Button>
        <Button type="button" variant="destructive" disabled={isDeleting} onClick={() => void handleDelete()}>
          {isDeleting ? t('msg_job_application_deleting') : t('msg_job_application_delete_confirm')}
        </Button>
      </div>
    </div>
  );
};

const EditJobApplication = ({ application, onBack, onSuccess }: EditProps) => {
  return <CreateJobApplicationForm application={application} onBack={onBack} onSuccess={onSuccess} />;
};

const JobApplicationDetails = ({ application }: Props) => {
  const { t, i18n } = useTranslation();
  const { closeModal, openModal } = useModal();
  const router = useRouter();

  const handleSuccess = () => {
    closeModal();
    router.refresh();
  };

  const handleBackToDetails = () => {
    openModal({
      closeLabel: t('msg_modal_close'),
      title: application.companyName,
      description: application.positionTitle,
      children: <JobApplicationDetails application={application} />,
    });
  };

  const handleEdit = () => {
    openModal({
      closeLabel: t('msg_modal_close'),
      title: t('msg_job_application_edit_modal_title'),
      description: t('msg_job_application_edit_modal_description'),
      children: <EditJobApplication application={application} onBack={handleBackToDetails} onSuccess={handleSuccess} />,
    });
  };

  const handleDelete = () => {
    openModal({
      closeLabel: t('msg_modal_close'),
      title: t('msg_job_application_delete_modal_title'),
      children: <DeleteJobApplicationConfirmation application={application} />,
    });
  };

  const formatDateTime = (value: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));

  return (
    <div className="space-y-6">
      <dl className="grid gap-5 sm:grid-cols-2">
        <Detail label={t('msg_job_application_company')} value={application.companyName} />
        <Detail label={t('msg_job_application_position')} value={application.positionTitle} />
        <Detail label={t('msg_job_application_status')} value={t(statusLabels[application.status])} />
        <Detail
          label={t('msg_job_application_applied_at')}
          value={application.appliedAt ?? t('msg_job_application_date_not_set')}
        />
        <Detail
          label={t('msg_job_application_url')}
          value={
            application.jobUrl ? (
              <a className="text-primary hover:underline" href={application.jobUrl} target="_blank" rel="noreferrer">
                {application.jobUrl}
              </a>
            ) : (
              t('msg_job_application_not_provided')
            )
          }
        />
        <Detail label={t('msg_job_application_created_at')} value={formatDateTime(application.createdAt)} />
        <Detail label={t('msg_job_application_updated_at')} value={formatDateTime(application.updatedAt)} />
        <div className="sm:col-span-2">
          <Detail
            label={t('msg_job_application_notes')}
            value={
              application.notes ? (
                <span className="whitespace-pre-wrap">{application.notes}</span>
              ) : (
                t('msg_job_application_not_provided')
              )
            }
          />
        </div>
      </dl>
      <div className="flex items-center justify-between gap-3 border-t pt-5">
        <Button
          type="button"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={handleDelete}
        >
          {t('msg_job_application_delete')}
        </Button>
        <Button type="button" onClick={handleEdit}>
          {t('msg_job_application_edit')}
        </Button>
      </div>
    </div>
  );
};

export const JobApplicationListItem = ({ application }: Props) => {
  const { t } = useTranslation();
  const { openModal } = useModal();

  const handleOpen = () => {
    openModal({
      closeLabel: t('msg_modal_close'),
      title: application.companyName,
      description: application.positionTitle,
      children: <JobApplicationDetails application={application} />,
    });
  };

  return (
    <li className="group relative grid gap-3 px-5 py-5 transition-colors focus-within:bg-muted/40 hover:bg-muted/40 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(7rem,0.8fr)_minmax(7rem,0.8fr)] md:items-center md:gap-6 md:px-6">
      <button
        type="button"
        className="absolute inset-0 z-0 cursor-pointer rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        aria-label={t('msg_job_application_view_details').replace('{{company}}', application.companyName)}
        onClick={handleOpen}
      />
      <p className="pointer-events-none relative z-1 min-w-0 truncate font-medium">{application.companyName}</p>
      <p className="pointer-events-none relative z-1 min-w-0 truncate text-sm md:text-base">
        {application.positionTitle}
      </p>
      <div className="pointer-events-none relative z-1">
        <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
          {t(statusLabels[application.status])}
        </span>
      </div>
      <p className="pointer-events-none relative z-1 text-sm text-muted-foreground">
        {application.appliedAt ?? t('msg_job_application_date_not_set')}
      </p>
    </li>
  );
};
