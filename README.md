# Job tracker

A pnpm monorepo for the job tracker frontend and backend.

## Structure

```text
job-tracker/
├── apps/
│   ├── backend/
│   └── frontend/
├── packages/       # Shared packages can be added later
├── package.json
└── pnpm-workspace.yaml
```

## Setup

Install dependencies from the repository root:

```bash
pnpm install
```

Create the local environment files:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
```

Run both applications in one terminal:

```bash
pnpm dev
```

The frontend runs at <http://localhost:3000/en> and the backend health endpoint is at <http://localhost:3001/health>.

Alternatively, run them in separate terminals:

```bash
pnpm dev:backend
pnpm dev:frontend
```

Run all formatting, linting, type, test, and production-build checks:

```bash
pnpm run check
```

Local environment files are ignored by Git.
