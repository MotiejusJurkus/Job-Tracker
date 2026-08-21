export const JOB_APPLICATION_STATUSES = [
  'wishlist',
  'applied',
  'interviewing',
  'offer',
  'rejected',
  'withdrawn',
] as const;

export const COMPANY_NAME_MAX_LENGTH = 200;
export const POSITION_TITLE_MAX_LENGTH = 200;
export const JOB_URL_MAX_LENGTH = 2048;
export const NOTES_MAX_LENGTH = 5000;

export type JobApplicationStatus = (typeof JOB_APPLICATION_STATUSES)[number];

export type CreateJobApplicationInput = {
  companyName: string;
  positionTitle: string;
  status: JobApplicationStatus;
  appliedAt: string;
  jobUrl: string;
  notes: string;
};

type ValidationRule = (value: string) => true | string;

export const requiredRule =
  (message: string): ValidationRule =>
  (value) =>
    value.trim().length > 0 || message;

export const maxLengthRule =
  (length: number, message: string): ValidationRule =>
  (value) =>
    value.length <= length || message;

export const validUrlRule =
  (message: string): ValidationRule =>
  (value) => {
    if (value.length === 0) {
      return true;
    }

    return URL.canParse(value) || message;
  };

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
