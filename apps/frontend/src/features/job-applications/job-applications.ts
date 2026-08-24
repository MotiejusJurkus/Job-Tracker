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

const listJobApplicationsResponseSchema = z.object({
  applications: z.array(createJobApplicationResponseSchema.shape.application),
});

export type JobApplication = z.infer<typeof createJobApplicationResponseSchema>['application'];

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

const handleMutationError = (error: unknown): never => {
  if (isAxiosError(error)) {
    const result = errorResponseSchema.safeParse(error.response?.data);

    if (result.success) {
      throw new Error(result.data.error);
    }
  }

  throw error;
};

export const updateJobApplication = async (applicationId: string, input: CreateJobApplicationInput) => {
  try {
    const { data } = await api.patch<unknown>(`/job-applications/${applicationId}`, input);

    return createJobApplicationResponseSchema.parse(data).application;
  } catch (error) {
    return handleMutationError(error);
  }
};

export const deleteJobApplication = async (applicationId: string) => {
  try {
    await api.delete(`/job-applications/${applicationId}`);
  } catch (error) {
    handleMutationError(error);
  }
};

export const listJobApplications = async (cookieHeader: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/job-applications`, {
    headers: { cookie: cookieHeader },
    cache: 'no-store',
  });

  if (response.status === 401) {
    return { status: 'unauthenticated' } as const;
  }

  if (!response.ok) {
    throw new Error('Unable to list job applications');
  }

  const data: unknown = await response.json();

  return {
    status: 'success',
    applications: listJobApplicationsResponseSchema.parse(data).applications,
  } as const;
};
