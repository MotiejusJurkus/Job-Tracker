'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/core/components/ui/button';
import { useModal } from '@/core/context/ModalProvider';
import { useTranslation } from '@/core/i18n/use-translation';

import { CreateJobApplicationForm } from './CreateJobApplicationForm';

export const AddJobApplicationButton = () => {
  const { t } = useTranslation();
  const { closeModal, openModal } = useModal();
  const router = useRouter();

  const handleSuccess = () => {
    closeModal();
    router.refresh();
  };

  const handleOpen = () => {
    openModal({
      closeLabel: t('msg_modal_close'),
      title: t('msg_job_application_modal_title'),
      description: t('msg_job_application_modal_description'),
      children: <CreateJobApplicationForm onSuccess={handleSuccess} />,
    });
  };

  return (
    <Button type="button" onClick={handleOpen}>
      {t('msg_job_application_open_modal')}
    </Button>
  );
};
