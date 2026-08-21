'use client';

import { useCallback, useState } from 'react';

import { Button } from '@/core/components/ui/button';
import { Modal } from '@/core/components/ui/Modal';
import { useTranslation } from '@/core/i18n/use-translation';

import { CreateJobApplicationForm } from './CreateJobApplicationForm';

export const AddJobApplicationModal = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <Button type="button" size="lg" onClick={() => setIsOpen(true)}>
        {t('msg_job_application_open_modal')}
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        closeLabel={t('msg_modal_close')}
        title={t('msg_job_application_modal_title')}
        description={t('msg_job_application_modal_description')}
      >
        <CreateJobApplicationForm onSuccess={handleClose} />
      </Modal>
    </>
  );
};
