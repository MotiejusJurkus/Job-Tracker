'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/core/components/ui/button';
import { useTranslation } from '@/core/i18n/use-translation';

import {
  type CreateUserInput,
  maxLengthRule,
  minLengthRule,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  requiredRule,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  validateRules,
  validUsernameRule,
} from '../schema';
import { createUser } from '../users';

type SubmissionStatus =
  { status: 'idle' } | { status: 'success'; message: string } | { status: 'error'; message: string };

const inputClassName =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20';

export const CreateUserForm = () => {
  const { t } = useTranslation();
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>({ status: 'idle' });

  const form = useForm<CreateUserInput>({
    defaultValues: { username: '', password: '' },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmissionStatus({ status: 'idle' });

    try {
      await createUser(values);
      form.reset();
      setSubmissionStatus({ status: 'success', message: t('msg_create_user_success') });
    } catch (error) {
      setSubmissionStatus({
        status: 'error',
        message: error instanceof Error ? error.message : t('msg_create_user_error'),
      });
    }
  });

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
      noValidate
    >
      <Controller
        name="username"
        control={form.control}
        rules={{
          validate: validateRules(
            requiredRule(t('msg_create_user_username_required')),
            minLengthRule(USERNAME_MIN_LENGTH, t('msg_create_user_username_invalid')),
            maxLengthRule(USERNAME_MAX_LENGTH, t('msg_create_user_username_invalid')),
            validUsernameRule(t('msg_create_user_username_invalid')),
          ),
        }}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="username">
              {t('msg_create_user_username')}
            </label>
            <input
              {...field}
              id="username"
              className={inputClassName}
              autoComplete="username"
              aria-describedby="username-help username-error"
              aria-invalid={fieldState.invalid}
            />
            <p id="username-help" className="text-xs text-muted-foreground">
              {t('msg_create_user_username_hint')}
            </p>
            {fieldState.error && (
              <p id="username-error" role="alert" className="text-sm text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />

      <Controller
        name="password"
        control={form.control}
        rules={{
          validate: validateRules(
            requiredRule(t('msg_create_user_password_required')),
            minLengthRule(PASSWORD_MIN_LENGTH, t('msg_create_user_password_invalid')),
            maxLengthRule(PASSWORD_MAX_LENGTH, t('msg_create_user_password_invalid')),
          ),
        }}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              {t('msg_create_user_password')}
            </label>
            <input
              {...field}
              id="password"
              type="password"
              className={inputClassName}
              autoComplete="new-password"
              aria-describedby="password-help password-error"
              aria-invalid={fieldState.invalid}
            />
            <p id="password-help" className="text-xs text-muted-foreground">
              {t('msg_create_user_password_hint')}
            </p>
            {fieldState.error && (
              <p id="password-error" role="alert" className="text-sm text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />

      {submissionStatus.status === 'success' && (
        <p role="status" className="text-sm text-success">
          {submissionStatus.message}
        </p>
      )}
      {submissionStatus.status === 'error' && (
        <p role="alert" className="text-sm text-destructive">
          {submissionStatus.message}
        </p>
      )}

      <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? t('msg_create_user_submitting') : t('msg_create_user_submit')}
      </Button>
    </form>
  );
};
