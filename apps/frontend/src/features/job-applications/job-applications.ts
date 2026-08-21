import { isAxiosError } from 'axios';
import { z } from 'zod';

import { api } from '@/core/utils/api';

import { type CreateJobApplicationInput, JOB_APPLICATION_STATUSES } from './schema';

const createJobApplicationResponseSchema = z.object({
  application: z.object({
    id: z.uuid(),
    companyName: z.string(),
    positionTitle: z.string(),
    status: z.enum(JOB_APPLICATION_STATUSES),
    appliedAt: z.iso.date().nullable(),
    jobUrl: z.string().nullable(),
    notes: z.string().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  }),
});

const errorResponseSchema = z.object({ error: z.string() });

export const createJobApplication = async (input: CreateJobApplicationInput) => {
  try {
    const { data } = await api.post<unknown>('/job-applications', input);

    return createJobApplicationResponseSchema.parse(data).application;
  } catch (error) {
    if (isAxiosError(error)) {
      const result = errorResponseSchema.safeParse(error.response?.data);

      if (result.success) {
        throw new Error(result.data.error);
      }
    }

    throw error;
  }
};
