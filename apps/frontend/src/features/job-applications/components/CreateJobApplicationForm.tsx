'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/core/components/ui/button';
import { useTranslation } from '@/core/i18n/use-translation';

import { createJobApplication } from '../job-applications';
import {
  COMPANY_NAME_MAX_LENGTH,
  type CreateJobApplicationInput,
  JOB_APPLICATION_STATUSES,
  JOB_URL_MAX_LENGTH,
  maxLengthRule,
  NOTES_MAX_LENGTH,
  POSITION_TITLE_MAX_LENGTH,
  requiredRule,
  validateRules,
  validUrlRule,
} from '../schema';

type SubmissionStatus =
  { status: 'idle' } | { status: 'success'; message: string } | { status: 'error'; message: string };

type Props = {
  onSuccess?: () => void;
};

const fieldClassName =
  'w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20';

const inputClassName = `h-10 ${fieldClassName}`;

const statusLabels = {
  wishlist: 'msg_job_application_status_wishlist',
  applied: 'msg_job_application_status_applied',
  interviewing: 'msg_job_application_status_interviewing',
  offer: 'msg_job_application_status_offer',
  rejected: 'msg_job_application_status_rejected',
  withdrawn: 'msg_job_application_status_withdrawn',
} as const;

export const CreateJobApplicationForm = ({ onSuccess }: Props) => {
  const { t } = useTranslation();
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>({ status: 'idle' });

  const form = useForm<CreateJobApplicationInput>({
    defaultValues: {
      companyName: '',
      positionTitle: '',
      status: 'applied',
      appliedAt: '',
      jobUrl: '',
      notes: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmissionStatus({ status: 'idle' });

    try {
      await createJobApplication(values);
      form.reset();
      setSubmissionStatus({ status: 'success', message: t('msg_job_application_success') });
      onSuccess?.();
    } catch (error) {
      setSubmissionStatus({
        status: 'error',
        message: error instanceof Error ? error.message : t('msg_job_application_error'),
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
      <div className="grid gap-6 sm:grid-cols-2">
        <Controller
          name="companyName"
          control={form.control}
          rules={{
            validate: validateRules(
              requiredRule(t('msg_job_application_company_required')),
              maxLengthRule(COMPANY_NAME_MAX_LENGTH, t('msg_job_application_company_invalid')),
            ),
          }}
          render={({ field, fieldState }) => (
            <Field
              label={t('msg_job_application_company')}
              error={fieldState.error?.message}
              id="company-name"
              isRequired
              requiredLabel={t('msg_job_application_required')}
            >
              <input
                {...field}
                id="company-name"
                className={inputClassName}
                autoComplete="organization"
                required
                aria-describedby="company-name-error"
                aria-invalid={fieldState.invalid}
              />
            </Field>
          )}
        />

        <Controller
          name="positionTitle"
          control={form.control}
          rules={{
            validate: validateRules(
              requiredRule(t('msg_job_application_position_required')),
              maxLengthRule(POSITION_TITLE_MAX_LENGTH, t('msg_job_application_position_invalid')),
            ),
          }}
          render={({ field, fieldState }) => (
            <Field
              label={t('msg_job_application_position')}
              error={fieldState.error?.message}
              id="position-title"
              isRequired
              requiredLabel={t('msg_job_application_required')}
            >
              <input
                {...field}
                id="position-title"
                className={inputClassName}
                required
                aria-describedby="position-title-error"
                aria-invalid={fieldState.invalid}
              />
            </Field>
          )}
        />

        <Controller
          name="status"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field label={t('msg_job_application_status')} error={fieldState.error?.message} id="application-status">
              <select
                {...field}
                id="application-status"
                className={inputClassName}
                aria-describedby="application-status-error"
                aria-invalid={fieldState.invalid}
              >
                {JOB_APPLICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {t(statusLabels[status])}
                  </option>
                ))}
              </select>
            </Field>
          )}
        />

        <Controller
          name="appliedAt"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field label={t('msg_job_application_applied_at')} error={fieldState.error?.message} id="applied-at">
              <input
                {...field}
                id="applied-at"
                type="date"
                className={inputClassName}
                aria-describedby="applied-at-error"
                aria-invalid={fieldState.invalid}
              />
            </Field>
          )}
        />
      </div>

      <Controller
        name="jobUrl"
        control={form.control}
        rules={{
          validate: validateRules(
            maxLengthRule(JOB_URL_MAX_LENGTH, t('msg_job_application_url_invalid')),
            validUrlRule(t('msg_job_application_url_invalid')),
          ),
        }}
        render={({ field, fieldState }) => (
          <Field label={t('msg_job_application_url')} error={fieldState.error?.message} id="job-url">
            <input
              {...field}
              id="job-url"
              type="url"
              className={inputClassName}
              placeholder="https://"
              aria-describedby="job-url-error"
              aria-invalid={fieldState.invalid}
            />
          </Field>
        )}
      />

      <Controller
        name="notes"
        control={form.control}
        rules={{ validate: maxLengthRule(NOTES_MAX_LENGTH, t('msg_job_application_notes_invalid')) }}
        render={({ field, fieldState }) => (
          <Field label={t('msg_job_application_notes')} error={fieldState.error?.message} id="application-notes">
            <textarea
              {...field}
              id="application-notes"
              rows={5}
              className={`py-3 ${fieldClassName}`}
              aria-describedby="application-notes-error"
              aria-invalid={fieldState.invalid}
            />
          </Field>
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

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? t('msg_job_application_submitting') : t('msg_job_application_submit')}
      </Button>
    </form>
  );
};

type FieldProps = {
  children: React.ReactNode;
  error?: string;
  id: string;
  isRequired?: boolean;
  label: string;
  requiredLabel?: string;
};

const Field = ({ children, error, id, isRequired = false, label, requiredLabel }: FieldProps) => (
  <div className="space-y-2">
    <label className="text-sm font-medium" htmlFor={id}>
      {label}
      {isRequired && (
        <>
          <span aria-hidden="true" className="text-destructive">
            {' '}
            *
          </span>
          <span className="sr-only"> {requiredLabel}</span>
        </>
      )}
    </label>
    {children}
    {error && (
      <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
        {error}
      </p>
    )}
  </div>
);
