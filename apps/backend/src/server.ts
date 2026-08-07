import 'dotenv/config';

import { app } from "./app.js";
import { getConfig } from "./config.js";
import { createDatabase } from './db/client.js';

const config = getConfig(process.env);
const { checkConnection } = createDatabase(config.databaseUrl);

await checkConnection();

app.listen(config.port, () => {
  console.log(`API is running at http://localhost:${config.port}`);
});
