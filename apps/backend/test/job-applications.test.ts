import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

import { createApp } from '../src/app.js';
import type {
  CreateJobApplication,
  DeleteJobApplication,
  ListJobApplications,
  UpdateJobApplication,
} from '../src/features/job-applications/job-applications.js';

const USER_ID = '2b4f7374-f7ee-45f9-a8aa-a434f5341a5f';
const SESSION_TOKEN = 'a'.repeat(43);
const FAILURE_SESSION_TOKEN = 'b'.repeat(43);
const CREATED_AT = new Date('2026-08-17T10:00:00.000Z');
const UPDATED_AT = new Date('2026-08-17T11:00:00.000Z');
const APPLICATION_ID = '8a633395-5ab6-4369-90ca-2c5ff16576f2';
const MISSING_APPLICATION_ID = '930e2697-d0f1-4637-b341-549e37acacc9';
const FAILURE_APPLICATION_ID = '422c3362-23db-4556-989e-52ac87380a4f';

let server: ReturnType<ReturnType<typeof createApp>['listen']>;
let baseUrl: string;

const createJobApplication: CreateJobApplication = (userId, input) => {
  if (input.companyName === 'Failure Inc.') {
    return Promise.reject(new Error('Database unavailable'));
  }

  return Promise.resolve({
    id: APPLICATION_ID,
    companyName: input.companyName,
    positionTitle: input.positionTitle,
    status: input.status,
    appliedAt: input.appliedAt ?? null,
    jobUrl: input.jobUrl ?? null,
    notes: `Created for ${userId}`,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
  });
};

const listJobApplications: ListJobApplications = (userId) => {
  if (userId === 'failure-user') {
    return Promise.reject(new Error('Database unavailable'));
  }

  return Promise.resolve([
    {
      id: APPLICATION_ID,
      companyName: `Applications for ${userId}`,
      positionTitle: 'Software Engineer',
      status: 'applied',
      appliedAt: '2026-08-17',
      jobUrl: null,
      notes: null,
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    },
  ]);
};

const updateJobApplication: UpdateJobApplication = (
  userId,
  applicationId,
  input,
) => {
  if (applicationId === FAILURE_APPLICATION_ID) {
    return Promise.reject(new Error('Database unavailable'));
  }

  if (applicationId === MISSING_APPLICATION_ID) {
    return Promise.resolve(undefined);
  }

  return Promise.resolve({
    id: applicationId,
    companyName: input.companyName ?? 'Acme Inc.',
    positionTitle: input.positionTitle ?? 'Software Engineer',
    status: input.status ?? 'applied',
    appliedAt: input.appliedAt ?? null,
    jobUrl: input.jobUrl ?? null,
    notes: `Updated for ${userId}`,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
  });
};

const deleteJobApplication: DeleteJobApplication = (_userId, applicationId) => {
  if (applicationId === FAILURE_APPLICATION_ID) {
    return Promise.reject(new Error('Database unavailable'));
  }

  return Promise.resolve(applicationId !== MISSING_APPLICATION_ID);
};

before(async () => {
  const app = createApp({
    authenticateSession: (token) => {
      if (token === SESSION_TOKEN) {
        return Promise.resolve({ id: USER_ID, username: 'Existing_User' });
      }

      if (token === FAILURE_SESSION_TOKEN) {
        return Promise.resolve({ id: 'failure-user', username: 'Error_User' });
      }

      return Promise.resolve(undefined);
    },
    createJobApplication,
    deleteJobApplication,
    listJobApplications,
    updateJobApplication,
  });

  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => resolve());
  });

  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

void test('job application endpoints require authentication', async () => {
  const [createResponse, listResponse, updateResponse, deleteResponse] = await Promise.all([
    fetch(`${baseUrl}/job-applications`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        companyName: 'Acme Inc.',
        positionTitle: 'Software Engineer',
      }),
    }),
    fetch(`${baseUrl}/job-applications`),
    fetch(`${baseUrl}/job-applications/${APPLICATION_ID}`, { method: 'PATCH' }),
    fetch(`${baseUrl}/job-applications/${APPLICATION_ID}`, { method: 'DELETE' }),
  ]);

  assert.equal(createResponse.status, 401);
  assert.equal(listResponse.status, 401);
  assert.equal(updateResponse.status, 401);
  assert.equal(deleteResponse.status, 401);
  assert.deepEqual(await createResponse.json(), {
    error: 'Authentication required',
  });
  assert.deepEqual(await listResponse.json(), {
    error: 'Authentication required',
  });
});

void test('PATCH /job-applications/:id updates an authenticated user application', async () => {
  const response = await fetch(`${baseUrl}/job-applications/${APPLICATION_ID}`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      cookie: `session=${SESSION_TOKEN}`,
    },
    body: JSON.stringify({ companyName: '  Updated Inc.  ', status: 'offer' }),
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    application: {
      id: APPLICATION_ID,
      companyName: 'Updated Inc.',
      positionTitle: 'Software Engineer',
      status: 'offer',
      appliedAt: null,
      jobUrl: null,
      notes: `Updated for ${USER_ID}`,
      createdAt: CREATED_AT.toISOString(),
      updatedAt: UPDATED_AT.toISOString(),
    },
  });
});

void test('PATCH rejects empty input and returns 404 for inaccessible applications', async () => {
  const [invalidResponse, missingResponse] = await Promise.all([
    fetch(`${baseUrl}/job-applications/${APPLICATION_ID}`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        cookie: `session=${SESSION_TOKEN}`,
      },
      body: JSON.stringify({}),
    }),
    fetch(`${baseUrl}/job-applications/${MISSING_APPLICATION_ID}`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        cookie: `session=${SESSION_TOKEN}`,
      },
      body: JSON.stringify({ status: 'rejected' }),
    }),
  ]);

  assert.equal(invalidResponse.status, 400);
  assert.equal(missingResponse.status, 404);
});

void test('DELETE /job-applications/:id deletes an authenticated user application', async () => {
  const response = await fetch(`${baseUrl}/job-applications/${APPLICATION_ID}`, {
    method: 'DELETE',
    headers: { cookie: `session=${SESSION_TOKEN}` },
  });

  assert.equal(response.status, 204);
  assert.equal(await response.text(), '');
});

void test('DELETE returns 400 for invalid IDs and 404 for inaccessible applications', async () => {
  const [invalidResponse, missingResponse] = await Promise.all([
    fetch(`${baseUrl}/job-applications/not-a-uuid`, {
      method: 'DELETE',
      headers: { cookie: `session=${SESSION_TOKEN}` },
    }),
    fetch(`${baseUrl}/job-applications/${MISSING_APPLICATION_ID}`, {
      method: 'DELETE',
      headers: { cookie: `session=${SESSION_TOKEN}` },
    }),
  ]);

  assert.equal(invalidResponse.status, 400);
  assert.equal(missingResponse.status, 404);
});

void test('POST /job-applications creates an application for the authenticated user', async () => {
  const response = await fetch(`${baseUrl}/job-applications`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: `session=${SESSION_TOKEN}`,
    },
    body: JSON.stringify({
      companyName: '  Acme Inc.  ',
      positionTitle: 'Software Engineer',
      appliedAt: '2026-08-17',
    }),
  });

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), {
    application: {
      id: '8a633395-5ab6-4369-90ca-2c5ff16576f2',
      companyName: 'Acme Inc.',
      positionTitle: 'Software Engineer',
      status: 'applied',
      appliedAt: '2026-08-17',
      jobUrl: null,
      notes: `Created for ${USER_ID}`,
      createdAt: CREATED_AT.toISOString(),
      updatedAt: UPDATED_AT.toISOString(),
    },
  });
});

void test('POST /job-applications rejects invalid and user-scoped input', async () => {
  const response = await fetch(`${baseUrl}/job-applications`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: `session=${SESSION_TOKEN}`,
    },
    body: JSON.stringify({
      companyName: 'Acme Inc.',
      positionTitle: 'Software Engineer',
      userId: 'another-user',
    }),
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: 'Invalid job application',
    details: {},
  });
});

void test('GET /job-applications lists applications for the authenticated user', async () => {
  const response = await fetch(`${baseUrl}/job-applications`, {
    headers: { cookie: `session=${SESSION_TOKEN}` },
  });
  const body: unknown = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    applications: [
      {
        id: '8a633395-5ab6-4369-90ca-2c5ff16576f2',
        companyName: `Applications for ${USER_ID}`,
        positionTitle: 'Software Engineer',
        status: 'applied',
        appliedAt: '2026-08-17',
        jobUrl: null,
        notes: null,
        createdAt: CREATED_AT.toISOString(),
        updatedAt: UPDATED_AT.toISOString(),
      },
    ],
  });
});

void test('job application endpoints handle storage failures', async () => {
  const [createResponse, updateResponse, deleteResponse, listResponse] = await Promise.all([
    fetch(`${baseUrl}/job-applications`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `session=${SESSION_TOKEN}`,
      },
      body: JSON.stringify({
        companyName: 'Failure Inc.',
        positionTitle: 'Software Engineer',
      }),
    }),
    fetch(`${baseUrl}/job-applications/${FAILURE_APPLICATION_ID}`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        cookie: `session=${SESSION_TOKEN}`,
      },
      body: JSON.stringify({ status: 'offer' }),
    }),
    fetch(`${baseUrl}/job-applications/${FAILURE_APPLICATION_ID}`, {
      method: 'DELETE',
      headers: { cookie: `session=${SESSION_TOKEN}` },
    }),
    fetch(`${baseUrl}/job-applications`, {
      headers: { cookie: `session=${FAILURE_SESSION_TOKEN}` },
    }),
  ]);

  assert.equal(createResponse.status, 500);
  assert.equal(listResponse.status, 500);
  assert.equal(updateResponse.status, 500);
  assert.equal(deleteResponse.status, 500);
  assert.deepEqual(await createResponse.json(), {
    error: 'Unable to create job application',
  });
  assert.deepEqual(await listResponse.json(), {
    error: 'Unable to list job applications',
  });
  assert.deepEqual(await updateResponse.json(), {
    error: 'Unable to update job application',
  });
  assert.deepEqual(await deleteResponse.json(), {
    error: 'Unable to delete job application',
  });
});
