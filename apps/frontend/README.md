# Job tracker frontend

The **Next.js App Router + TypeScript** frontend for the job tracker.

## Stack

- **Next.js 16** (App Router, React Compiler, standalone output) + **React 19**
- **TypeScript** (strict) with `@/*` → `src/*` path alias
- **Tailwind CSS v4** (CSS-first, no `tailwind.config.js`) + **shadcn/ui** (`new-york`, neutral)
- **TanStack Query** (server state) + **Axios** (HTTP) + **Zod** (validation)
- **Zustand** (client state), **react-hook-form** (forms)
- **i18next** / **react-i18next** with `[lng]` routing
- **Sentry** (optional — enabled only when a DSN is set)
- ESLint 9 (flat config, type-aware) + Prettier

## Prerequisites

- **Node** ≥ 20
- **pnpm** ≥ 9 (`corepack enable` or `npm i -g pnpm`)

## Setup

```bash
cp .env.example .env   # then fill in values
pnpm install
pnpm dev               # frontend: http://localhost:3000/en
```

## Scripts

| Script               | What it does                                  |
| -------------------- | --------------------------------------------- |
| `pnpm dev`           | Start the dev server                          |
| `pnpm build`         | Production build                              |
| `pnpm start`         | Serve the production build                    |
| `pnpm lint`          | ESLint                                        |
| `pnpm lint:fix`      | Prettier write + ESLint `--fix`               |
| `pnpm lint:prettier` | Check formatting only                         |
| `pnpm typelint`      | `tsc --noEmit`                                |
| `pnpm check:code`    | Prettier check + ESLint + typecheck (CI gate) |

## Environment

Public env is validated at module load with Zod in [`src/config/env.ts`](src/config/env.ts).
A missing or malformed variable fails fast. See [`.env.example`](.env.example) for the full list.
Set `NEXT_PUBLIC_SENTRY_DSN` to enable Sentry; leave it empty to disable it entirely.

## Folder conventions

```
src/
  app/
    [lng]/            # locale segment — all routes live here
      layout.tsx      # root layout (html/body + provider tree)
      page.tsx        # demo home page
    globals.css       # Tailwind theme via @theme inline
    providers.tsx     # QueryProvider + TranslationsProvider (client)
    global-error.tsx  # Sentry-aware global error boundary
  config/             # constants + Zod-validated env
  core/               # shared infrastructure
    components/ui/     # shadcn primitives
    components/utils.ts# cn() helper
    hooks/             # useIsMobile, useLanguage, …
    i18n/              # i18next setup, language helpers, provider
    utils/             # query client, axios instances
  features/           # one folder per domain slice (see features/README.md)
  types/              # app-wide shared types
  middleware.ts       # redirects `/` → `/{defaultLanguage}`
```

Server Components are the default; add `'use client'` only for interactivity/hooks. Client
data fetching goes through TanStack Query (never `useEffect` + `fetch`).

## Adding a shadcn/ui component

`components.json` is preconfigured (style `new-york`, base color `neutral`, `cssVariables`,
aliases pointing at `@/core/components/ui` and `@/core/components/utils`). Add components with:

```bash
pnpx shadcn@latest add button
```

They land in [`src/core/components/ui/`](src/core/components/ui/).

## Adding a feature

See [`src/features/README.md`](src/features/README.md). The included `posts` feature is a
working reference for the query-factory + axios + Zod pattern.
