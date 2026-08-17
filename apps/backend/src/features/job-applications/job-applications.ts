import { desc, eq } from 'drizzle-orm';

import type { Database } from '../../db/client.js';
import { jobApplications } from '../../db/schema.js';
import {
  type CreateJobApplicationInput,
  type JobApplicationRecord,
  jobApplicationRecordSchema,
} from './schema.js';

const jobApplicationSelection = {
  id: jobApplications.id,
  companyName: jobApplications.companyName,
  positionTitle: jobApplications.positionTitle,
  status: jobApplications.status,
  appliedAt: jobApplications.appliedAt,
  jobUrl: jobApplications.jobUrl,
  notes: jobApplications.notes,
  createdAt: jobApplications.createdAt,
  updatedAt: jobApplications.updatedAt,
};

export const createDatabaseJobApplication = async (
  database: Database,
  userId: string,
  input: CreateJobApplicationInput,
): Promise<JobApplicationRecord> => {
  const [application] = await database
    .insert(jobApplications)
    .values({
      userId,
      companyName: input.companyName,
      positionTitle: input.positionTitle,
      status: input.status,
      appliedAt: input.appliedAt,
      jobUrl: input.jobUrl,
      notes: input.notes,
    })
    .returning(jobApplicationSelection);

  if (application === undefined) {
    throw new Error('Job application insert did not return a row');
  }

  return jobApplicationRecordSchema.parse(application);
};

export const listDatabaseJobApplications = async (
  database: Database,
  userId: string,
): Promise<JobApplicationRecord[]> => {
  const applications = await database
    .select(jobApplicationSelection)
    .from(jobApplications)
    .where(eq(jobApplications.userId, userId))
    .orderBy(desc(jobApplications.createdAt));

  return jobApplicationRecordSchema.array().parse(applications);
};
