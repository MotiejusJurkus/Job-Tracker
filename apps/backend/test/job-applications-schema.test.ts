import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  createJobApplicationSchema,
  createJobApplicationResponseSchema,
  listJobApplicationsResponseSchema,
  updateJobApplicationSchema,
} from '../src/features/job-applications/schema.js';

void test('createJobApplicationSchema parses a complete application', () => {
  const result = createJobApplicationSchema.parse({
    companyName: '  Acme Inc.  ',
    positionTitle: '  Software Engineer  ',
    status: 'interviewing',
    appliedAt: '2026-08-17',
    jobUrl: 'https://example.com/jobs/123',
    notes: '  Referred by Alex  ',
  });

  assert.deepEqual(result, {
    companyName: 'Acme Inc.',
    positionTitle: 'Software Engineer',
    status: 'interviewing',
    appliedAt: '2026-08-17',
    jobUrl: 'https://example.com/jobs/123',
    notes: 'Referred by Alex',
  });
});

void test('updateJobApplicationSchema accepts partial input and rejects empty input', () => {
  assert.deepEqual(
    updateJobApplicationSchema.parse({ companyName: '  Updated Inc.  ' }),
    { companyName: 'Updated Inc.' },
  );
  assert.equal(updateJobApplicationSchema.safeParse({}).success, false);
  assert.equal(
    updateJobApplicationSchema.safeParse({ userId: 'another-user' }).success,
    false,
  );
});

void test('createJobApplicationSchema applies defaults and normalizes blank optional fields', () => {
  const result = createJobApplicationSchema.parse({
    companyName: 'Acme Inc.',
    positionTitle: 'Software Engineer',
    appliedAt: '',
    jobUrl: '',
    notes: '',
  });

  assert.deepEqual(result, {
    companyName: 'Acme Inc.',
    positionTitle: 'Software Engineer',
    status: 'applied',
    appliedAt: null,
    jobUrl: null,
    notes: null,
  });
});

void test('createJobApplicationSchema rejects invalid and unexpected fields', () => {
  const result = createJobApplicationSchema.safeParse({
    companyName: '',
    positionTitle: 'Software Engineer',
    status: 'pending',
    appliedAt: '17-08-2026',
    jobUrl: 'not-a-url',
    userId: '8a633395-5ab6-4369-90ca-2c5ff16576f2',
  });

  assert.equal(result.success, false);
});

void test('response schemas parse create and list payloads', () => {
  const application = {
    id: '8a633395-5ab6-4369-90ca-2c5ff16576f2',
    companyName: 'Acme Inc.',
    positionTitle: 'Software Engineer',
    status: 'applied',
    appliedAt: '2026-08-17',
    jobUrl: null,
    notes: null,
    createdAt: '2026-08-17T10:00:00.000Z',
    updatedAt: '2026-08-17T10:00:00.000Z',
  };

  assert.deepEqual(
    createJobApplicationResponseSchema.parse({ application }),
    { application },
  );
  assert.deepEqual(
    listJobApplicationsResponseSchema.parse({ applications: [application] }),
    { applications: [application] },
  );
});
