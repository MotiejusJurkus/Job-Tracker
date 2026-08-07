import { sql } from 'drizzle-orm';
import {
  check,
  date,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const JOB_APPLICATION_STATUSES = [
  'wishlist',
  'applied',
  'interviewing',
  'offer',
  'rejected',
  'withdrawn',
] as const;

export const users = pgTable(
  'users',
  {
    id: uuid().defaultRandom().primaryKey(),
    username: text().notNull(),
    usernameNormalized: text('username_normalized').notNull(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('users_username_normalized_uidx').on(table.usernameNormalized),
    check(
      'users_username_length_check',
      sql`char_length(${table.username}) between 3 and 30`,
    ),
    check(
      'users_username_normalized_length_check',
      sql`char_length(${table.usernameNormalized}) between 3 and 30`,
    ),
    check(
      'users_username_normalized_format_check',
      sql`${table.usernameNormalized} ~ '^[a-z0-9_]+$'`,
    ),
  ],
);

export const sessions = pgTable(
  'sessions',
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('sessions_token_hash_uidx').on(table.tokenHash),
    index('sessions_user_id_idx').on(table.userId),
    index('sessions_expires_at_idx').on(table.expiresAt),
    check('sessions_token_hash_length_check', sql`char_length(${table.tokenHash}) = 64`),
  ],
);

export const jobApplications = pgTable(
  'job_applications',
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    companyName: text('company_name').notNull(),
    positionTitle: text('position_title').notNull(),
    status: text().default('applied').notNull(),
    appliedAt: date('applied_at'),
    jobUrl: text('job_url'),
    notes: text(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('job_applications_user_created_at_idx').on(table.userId, table.createdAt.desc()),
    index('job_applications_user_status_idx').on(table.userId, table.status),
    check(
      'job_applications_company_name_length_check',
      sql`char_length(${table.companyName}) between 1 and 200`,
    ),
    check(
      'job_applications_position_title_length_check',
      sql`char_length(${table.positionTitle}) between 1 and 200`,
    ),
    check(
      'job_applications_status_check',
      sql`${table.status} in ('wishlist', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn')`,
    ),
    check(
      'job_applications_job_url_length_check',
      sql`${table.jobUrl} is null or char_length(${table.jobUrl}) <= 2048`,
    ),
    check(
      'job_applications_notes_length_check',
      sql`${table.notes} is null or char_length(${table.notes}) <= 5000`,
    ),
  ],
);
