import { z } from 'zod';

import { JOB_APPLICATION_STATUSES } from '../../db/schema.js';

const COMPANY_NAME_MAX_LENGTH = 200;
const POSITION_TITLE_MAX_LENGTH = 200;
const JOB_URL_MAX_LENGTH = 2048;
const NOTES_MAX_LENGTH = 5000;

const nullableJobUrlSchema = z
  .union([
    z.url().max(JOB_URL_MAX_LENGTH),
    z.literal('').transform(() => null),
  ])
  .nullable()
  .optional();

const nullableNotesSchema = z
  .union([
    z.string().trim().max(NOTES_MAX_LENGTH).min(1),
    z.literal('').transform(() => null),
  ])
  .nullable()
  .optional();

const nullableAppliedAtSchema = z
  .union([z.iso.date(), z.literal('').transform(() => null)])
  .nullable()
  .optional();

export const jobApplicationStatusSchema = z.enum(JOB_APPLICATION_STATUSES);

const jobApplicationInputSchema = z
  .object({
    companyName: z.string().trim().min(1).max(COMPANY_NAME_MAX_LENGTH),
    positionTitle: z.string().trim().min(1).max(POSITION_TITLE_MAX_LENGTH),
    status: jobApplicationStatusSchema,
    appliedAt: nullableAppliedAtSchema,
    jobUrl: nullableJobUrlSchema,
    notes: nullableNotesSchema,
  })
  .strict();

export const createJobApplicationSchema = jobApplicationInputSchema.extend({
  status: jobApplicationStatusSchema.default('applied'),
});

export const updateJobApplicationSchema = jobApplicationInputSchema
  .partial()
  .refine((input) => Object.keys(input).length > 0, {
    message: 'At least one field is required',
  });

export const jobApplicationSchema = z.object({
  id: z.uuid(),
  companyName: z.string(),
  positionTitle: z.string(),
  status: jobApplicationStatusSchema,
  appliedAt: z.iso.date().nullable(),
  jobUrl: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const jobApplicationRecordSchema = jobApplicationSchema.extend({
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createJobApplicationResponseSchema = z.object({
  application: jobApplicationSchema,
});

export const updateJobApplicationResponseSchema = createJobApplicationResponseSchema;

export const listJobApplicationsResponseSchema = z.object({
  applications: z.array(jobApplicationSchema),
});

export type CreateJobApplicationInput = z.infer<
  typeof createJobApplicationSchema
>;
export type UpdateJobApplicationInput = z.infer<
  typeof updateJobApplicationSchema
>;
export type JobApplication = z.infer<typeof jobApplicationSchema>;
export type JobApplicationRecord = z.infer<
  typeof jobApplicationRecordSchema
>;
