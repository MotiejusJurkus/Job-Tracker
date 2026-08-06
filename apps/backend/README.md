# Backend template

A small Node.js, TypeScript, and Express API for learning and experimentation.

## Requirements

- Node.js 20 or newer
- pnpm 11 or newer

Check that they are installed:

```bash
node --version
pnpm --version
```

## Run the project

```bash
cd backend-template
pnpm install
pnpm dev
```

Open <http://localhost:3000/health> in a browser, or run:

```bash
curl http://localhost:3000/health
```

The response will look like this:

```json
{
  "status": "ok",
  "timestamp": "2026-08-05T12:00:00.000Z"
}
```

Stop the server with `Ctrl+C`.

## Useful commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Runs the API and restarts it when a file changes |
| `pnpm start` | Runs the API without file watching |
| `pnpm test` | Runs the automated health-check test |
| `pnpm typelint` | Checks the TypeScript types without creating build files |

To use a different port:

```bash
PORT=4000 pnpm dev
```

## Project structure

```text
backend-template/
├── src/
│   ├── app.ts       # Creates the Express app and defines routes
│   └── server.ts    # Starts the HTTP server
├── test/
│   └── health.test.ts
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
└── README.md
```

## How to create this manually

1. Create the project and enter it:

   ```bash
   mkdir backend-template
   cd backend-template
   ```

2. Make sure pnpm is available, then create a default Node.js project:

   ```bash
   corepack enable
   corepack prepare pnpm@latest --activate
   pnpm init
   ```

   This creates `package.json`, which records project details, commands, and dependencies.

3. Install Express and the TypeScript tooling:

   ```bash
   pnpm add express
   pnpm add -D typescript tsx @types/node @types/express
   ```

   This creates `node_modules` and `pnpm-lock.yaml`, and records the runtime and development dependencies in `package.json`.

4. Create the source directory and files:

   ```bash
   mkdir src
   touch src/app.ts src/server.ts
   ```

5. In `src/app.ts`, create the Express application and its health route:

   ```ts
   import express from "express";

   export const app = express();
   app.use(express.json());

   app.get("/health", (_request, response) => {
     response.status(200).json({ status: "ok" });
   });
   ```

6. In `src/server.ts`, start the application:

   ```ts
   import { app } from "./app.js";

   const DEFAULT_PORT = 3000;
   const port = Number(process.env.PORT) || DEFAULT_PORT;

   app.listen(port, () => {
     console.log(`API is running at http://localhost:${port}`);
   });
   ```

7. Create `tsconfig.json` and enable strict TypeScript checking:

   ```json
   {
     "compilerOptions": {
       "target": "ES2022",
       "module": "NodeNext",
       "moduleResolution": "NodeNext",
       "esModuleInterop": true,
       "strict": true,
       "noEmit": true,
       "skipLibCheck": true
     },
     "include": ["src/**/*.ts", "test/**/*.ts"]
   }
   ```

8. Add `"type": "module"` and these commands to `package.json`:

   ```json
   {
     "scripts": {
       "dev": "tsx watch src/server.ts",
       "start": "tsx src/server.ts",
       "test": "tsx --test test/**/*.test.ts",
       "typelint": "tsc --noEmit"
     }
   }
   ```

9. Run the API with `pnpm dev`, then visit `/health`.

## What to try next

- Add a `GET /hello` route.
- Return a name from `GET /hello/:name`.
- Add environment variables with Node's `--env-file` option.
- Connect a database once routing feels comfortable.
