import { desc, eq } from 'drizzle-orm';
import { Router } from 'express';
import { z } from 'zod';

import type { Database } from '../../db/client.js';
import { jobApplications } from '../../db/schema.js';
import {
  type AuthenticateSession,
  createRequireAuth,
} from '../auth/require-auth.js';
import {
  createJobApplicationSchema,
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

export type CreateJobApplication = (
  userId: string,
  input: CreateJobApplicationInput,
) => Promise<JobApplicationRecord>;

export type ListJobApplications = (
  userId: string,
) => Promise<JobApplicationRecord[]>;

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

export const createJobApplicationsRouter = (
  authenticateSession: AuthenticateSession,
  createJobApplication: CreateJobApplication,
  listJobApplications: ListJobApplications,
): Router => {
  const router = Router();

  router.use(createRequireAuth(authenticateSession));

  router.post('/', async (request, response) => {
    const user = response.locals.user;

    if (user === undefined) {
      response.status(500).json({ error: 'Unable to authenticate session' });
      return;
    }

    const input = createJobApplicationSchema.safeParse(request.body);

    if (!input.success) {
      response.status(400).json({
        error: 'Invalid job application',
        details: z.flattenError(input.error).fieldErrors,
      });
      return;
    }

    try {
      const application = await createJobApplication(user.id, input.data);
      response.status(201).json({ application });
    } catch {
      response.status(500).json({ error: 'Unable to create job application' });
    }
  });

  router.get('/', async (_request, response) => {
    const user = response.locals.user;

    if (user === undefined) {
      response.status(500).json({ error: 'Unable to authenticate session' });
      return;
    }

    try {
      const applications = await listJobApplications(user.id);
      response.status(200).json({ applications });
    } catch {
      response.status(500).json({ error: 'Unable to list job applications' });
    }
  });

  return router;
};
