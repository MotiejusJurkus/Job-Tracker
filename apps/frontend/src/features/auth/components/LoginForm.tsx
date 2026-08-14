'use client';

import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/core/components/ui/button';
import { useTranslation } from '@/core/i18n/use-translation';
import {
  type CreateUserInput,
  maxLengthRule,
  minLengthRule,
  PASSWORD_MAX_LENGTH,
  requiredRule,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  validateRules,
  validUsernameRule,
} from '@/features/users/schema';

const inputClassName =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20';

export const LoginForm = () => {
  const { t } = useTranslation();

  const form = useForm<CreateUserInput>({
    defaultValues: { username: '', password: '' },
  });

  return (
    <form className="space-y-6" noValidate>
      <Controller
        name="username"
        control={form.control}
        rules={{
          validate: validateRules(
            requiredRule(t('msg_login_username_required')),
            minLengthRule(USERNAME_MIN_LENGTH, t('msg_login_username_invalid')),
            maxLengthRule(USERNAME_MAX_LENGTH, t('msg_login_username_invalid')),
            validUsernameRule(t('msg_login_username_invalid')),
          ),
        }}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="login-username">
              {t('msg_login_username')}
            </label>
            <input
              {...field}
              id="login-username"
              className={inputClassName}
              autoComplete="username"
              aria-describedby="login-username-error"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.error && (
              <p id="login-username-error" role="alert" className="text-sm text-destructive">
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
            requiredRule(t('msg_login_password_required')),
            maxLengthRule(PASSWORD_MAX_LENGTH, t('msg_login_password_invalid')),
          ),
        }}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="login-password">
              {t('msg_login_password')}
            </label>
            <input
              {...field}
              id="login-password"
              type="password"
              className={inputClassName}
              autoComplete="current-password"
              aria-describedby="login-password-error"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.error && (
              <p id="login-password-error" role="alert" className="text-sm text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />

      <Button className="w-full" type="button" disabled>
        {t('msg_login_submit')}
      </Button>
    </form>
  );
};
