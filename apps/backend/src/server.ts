import 'dotenv/config';

import { createApp } from "./app.js";
import { getConfig } from "./config.js";
import { createDatabase } from './db/client.js';
import { createDatabaseLogin } from './features/auth/auth.js';
import { createDatabaseLogout } from './features/auth/logout.js';
import { createDatabaseAuthenticateSession } from './features/auth/require-auth.js';
import {
  createDatabaseJobApplication,
  listDatabaseJobApplications,
} from './features/job-applications/job-applications.js';
import { createDatabaseUser } from './features/users/users.js';

const config = getConfig(process.env);
const { database, checkConnection } = createDatabase(config.databaseUrl);

await checkConnection();

const app = createApp({
  authenticateSession: createDatabaseAuthenticateSession(database),
  createJobApplication: (userId, input) =>
    createDatabaseJobApplication(database, userId, input),
  createUser: (input) => createDatabaseUser(database, input),
  isSecureCookie: process.env.NODE_ENV === 'production',
  listJobApplications: (userId) =>
    listDatabaseJobApplications(database, userId),
  login: createDatabaseLogin(database),
  logout: createDatabaseLogout(database),
});

app.listen(config.port, () => {
  console.log(`API is running at http://localhost:${config.port}`);
});
