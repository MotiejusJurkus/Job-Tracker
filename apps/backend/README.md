# Job tracker API

The Express and TypeScript API for the job tracker.

## Development

From the repository root:

```bash
pnpm install
cp apps/backend/.env.example apps/backend/.env
pnpm dev:backend
```

The health endpoint is available at <http://localhost:3001/health> by default.

## Database

The API connects to Supabase-hosted PostgreSQL through Drizzle ORM. Set `DATABASE_URL` in
`.env`; never expose this value to the frontend or commit it to Git.

Check connectivity before applying migrations:

```bash
pnpm db:check
```

After changing `src/db/schema.ts`, generate and review a migration before applying it:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:verify
```

Generated SQL is stored in `drizzle/` and must be committed. Use `db:studio` only as a
development inspection tool; schema changes belong in migrations.

## Validation and production

```bash
pnpm --filter @job-tracker/backend lint
pnpm --filter @job-tracker/backend typelint
pnpm --filter @job-tracker/backend test
pnpm --filter @job-tracker/backend build
pnpm --filter @job-tracker/backend start
```

`build` compiles the application to `dist/`; `start` runs the compiled JavaScript. Set `PORT` to an integer from 1 through 65535 to override the default port of 3001.
