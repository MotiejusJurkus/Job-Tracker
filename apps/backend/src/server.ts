import 'dotenv/config';

import { createApp } from "./app.js";
import { getConfig } from "./config.js";
import { createDatabase } from './db/client.js';
import { createDatabaseUser } from './features/users/users.js';

const config = getConfig(process.env);
const { database, checkConnection } = createDatabase(config.databaseUrl);

await checkConnection();

const app = createApp({
  createUser: (input) => createDatabaseUser(database, input),
});

app.listen(config.port, () => {
  console.log(`API is running at http://localhost:${config.port}`);
});
