# Features

Each subfolder here is a **feature slice** that owns everything for one domain: its
components, hooks, stores, API calls, and types. Keep features self-contained — shared
infrastructure belongs in `src/core/`, not here.

## Recommended layout

```
features/
  <domain>/
    components/        # React components scoped to this feature
    hooks/             # feature-specific hooks (e.g. mutations)
    stores/            # Zustand stores (use<Name>Store.ts)
    <domain>.ts        # TanStack Query factory + axios fetchers + Zod schemas
```

## Conventions

- **Queries** live in `<domain>.ts` as a factory object (`<domain>Queries`): key-only entries
  for invalidation, `queryOptions()` entries for fetching. Call `useQuery(<domain>Queries.list())`
  directly in components.
- **Mutations** are custom hooks wrapping `useMutation` + `useQueryClient` for invalidation.
- **Validation**: parse all network responses with Zod (`schema.parse(data)`) — never cast.
- **State**: server data → TanStack Query; client/UI state → Zustand (one store per feature).
- **i18n keys**: `msg_<feature>_<description>`.

See `posts/` for a working reference (query factory + axios + Zod + a client list component).
