const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export type CreateUserInput = {
  username: string;
  password: string;
};

type ValidationRule = (value: string) => true | string;

export const requiredRule =
  (message: string): ValidationRule =>
  (value) =>
    value.length > 0 || message;

export const minLengthRule =
  (length: number, message: string): ValidationRule =>
  (value) =>
    value.length >= length || message;

export const maxLengthRule =
  (length: number, message: string): ValidationRule =>
  (value) =>
    value.length <= length || message;

export const validUsernameRule =
  (message: string): ValidationRule =>
  (value) =>
    USERNAME_PATTERN.test(value) || message;

export const validateRules =
  (...rules: ValidationRule[]): ValidationRule =>
  (value) => {
    for (const rule of rules) {
      const result = rule(value);

      if (result !== true) {
        return result;
      }
    }

    return true;
  };
