'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/core/components/ui/button';
import { useLanguage } from '@/core/hooks/use-language';
import { useTranslation } from '@/core/i18n/use-translation';

import { logout } from '../auth';

export const LogoutButton = () => {
  const { t } = useTranslation();
  const lng = useLanguage();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    setErrorMessage(undefined);
    setIsSubmitting(true);

    try {
      await logout();
      router.replace(`/${lng}/login`);
    } catch {
      setErrorMessage(t('msg_logout_error'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 text-center">
      <Button
        type="button"
        disabled={isSubmitting}
        onClick={() => {
          void handleLogout();
        }}
      >
        {isSubmitting ? t('msg_logout_submitting') : t('msg_logout_submit')}
      </Button>

      {errorMessage && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
