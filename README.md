# Job Tracker

A full-stack application for keeping job applications organized in one place. Users can create an account, sign in, and manage a private list of applications with company, role, status, date, URL, and notes.

## Features

- Account registration, login, logout, and persistent cookie-based sessions
- Protected application pages and API endpoints
- Per-user job application data with create, list, update, and delete operations
- Localized frontend routes (English is currently the default)
- Request validation, authentication rate limits, and secure HTTP headers

## Tech stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, TanStack Query, Axios, Zod
- **Backend:** Express 5, TypeScript, Zod
- **Database:** PostgreSQL (Supabase) with Drizzle ORM
- **Tooling:** pnpm workspaces, ESLint, Prettier, Node test runner

## Repository structure

```text
job-tracker/
├── apps/
│   ├── backend/     # Express API, database schema, migrations, and tests
│   └── frontend/    # Next.js application
├── package.json     # Workspace scripts
└── pnpm-workspace.yaml
```

## Prerequisites

- Node.js 20.9 or newer
- pnpm 11 (Corepack is recommended)
- A PostgreSQL database

## Local setup

1. Install dependencies from the repository root:

   ```bash
   corepack enable
   pnpm install
   ```

2. Create the local environment files:

   ```bash
   cp apps/backend/.env.example apps/backend/.env
   cp apps/frontend/.env.example apps/frontend/.env.local
   ```

3. Set `DATABASE_URL` in `apps/backend/.env` to your PostgreSQL connection string. The other example values work with the default local ports.

4. Apply the committed database migrations and verify the schema:

   ```bash
   pnpm db:migrate
   pnpm db:verify
   ```

5. Start both applications:

   ```bash
   pnpm dev
   ```

Open <http://localhost:3000/en>. The API runs on <http://localhost:3001>, and its health endpoint is available at <http://localhost:3001/health>.

To run each application separately, use `pnpm dev:frontend` and `pnpm dev:backend`.

## Environment variables

Backend (`apps/backend/.env`):

| Variable | Purpose | Default example |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | API port | `3001` |
| `FRONTEND_ORIGIN` | Allowed browser origin | `http://localhost:3000` |

Frontend (`apps/frontend/.env.local`):

| Variable | Purpose | Default example |
| --- | --- | --- |
| `NEXT_PUBLIC_NODE_ENV` | Application environment | `dev` |
| `NEXT_PUBLIC_SITE_URL` | Frontend URL | `http://localhost:3000/` |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:3001` |
| `NEXT_PUBLIC_DEFAULT_LANGUAGE` | Default locale | `en` |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional Sentry DSN | Empty (disabled) |

Do not expose `DATABASE_URL` to the frontend or commit local environment files.

## Common commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Run the frontend and backend together |
| `pnpm build` | Build all applications |
| `pnpm lint` | Lint all workspaces |
| `pnpm typelint` | Type-check all workspaces |
| `pnpm test` | Run all tests |
| `pnpm check` | Run linting, type checks, tests, and production builds |
| `pnpm db:check` | Check the database connection |
| `pnpm db:generate` | Generate a migration from schema changes |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:verify` | Verify the expected database schema |
| `pnpm db:studio` | Open Drizzle Studio for local inspection |

For implementation-specific guidance, see the [frontend](apps/frontend/README.md) and [backend](apps/backend/README.md) documentation.
