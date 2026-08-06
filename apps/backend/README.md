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

## Validation and production

```bash
pnpm --filter @job-tracker/backend lint
pnpm --filter @job-tracker/backend typelint
pnpm --filter @job-tracker/backend test
pnpm --filter @job-tracker/backend build
pnpm --filter @job-tracker/backend start
```

`build` compiles the application to `dist/`; `start` runs the compiled JavaScript. Set `PORT` to an integer from 1 through 65535 to override the default port of 3001.
