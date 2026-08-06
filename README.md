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

Run the backend:

```bash
pnpm dev:backend
```

Once the frontend template is added, run it with:

```bash
pnpm dev:frontend
```

When adding the frontend template, copy or clone its files into `apps/frontend` and remove its nested `.git` directory so Git tracks the entire monorepo as one repository.
