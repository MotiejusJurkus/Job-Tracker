import "dotenv/config";

import { createApp } from "./app.js";
import { getConfig } from "./config.js";
import { createDatabase } from "./db/client.js";
import { createDatabaseLogin } from "./features/auth/auth.js";
import { createDatabaseLogout } from "./features/auth/logout.js";
import { createDatabaseAuthenticateSession } from "./features/auth/require-auth.js";
import { createDatabaseSignup } from "./features/auth/signup.js";
import {
  createDatabaseJobApplication,
  deleteDatabaseJobApplication,
  listDatabaseJobApplications,
  updateDatabaseJobApplication,
} from "./features/job-applications/job-applications.js";
import { createDatabaseUser } from "./features/users/users.js";

const config = getConfig(process.env);
const { database, checkConnection } = createDatabase(config.databaseUrl);

await checkConnection();

const app = createApp({
  authenticateSession: createDatabaseAuthenticateSession(database),
  createJobApplication: (userId, input) =>
    createDatabaseJobApplication(database, userId, input),
  createUser: (input) => createDatabaseUser(database, input),
  deleteJobApplication: (userId, applicationId) =>
    deleteDatabaseJobApplication(database, userId, applicationId),
  frontendOrigin: config.frontendOrigin,
  isSecureCookie: process.env.NODE_ENV === "production",
  listJobApplications: (userId) =>
    listDatabaseJobApplications(database, userId),
  login: createDatabaseLogin(database),
  logout: createDatabaseLogout(database),
  signup: createDatabaseSignup(database),
  updateJobApplication: (userId, applicationId, input) =>
    updateDatabaseJobApplication(database, userId, applicationId, input),
});

app.listen(config.port, () => {
  console.log(`API is running at http://localhost:${config.port}`);
});
