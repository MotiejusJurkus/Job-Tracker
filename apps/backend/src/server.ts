import 'dotenv/config';

import { createApp } from "./app.js";
import { getConfig } from "./config.js";
import { createDatabase } from './db/client.js';
import { createDatabaseLogin } from './features/auth/auth.js';
import { createDatabaseAuthenticateSession } from './features/auth/require-auth.js';
import { createDatabaseUser } from './features/users/users.js';

const config = getConfig(process.env);
const { database, checkConnection } = createDatabase(config.databaseUrl);

await checkConnection();

const app = createApp({
  authenticateSession: createDatabaseAuthenticateSession(database),
  createUser: (input) => createDatabaseUser(database, input),
  isSecureCookie: process.env.NODE_ENV === 'production',
  login: createDatabaseLogin(database),
});

app.listen(config.port, () => {
  console.log(`API is running at http://localhost:${config.port}`);
});
