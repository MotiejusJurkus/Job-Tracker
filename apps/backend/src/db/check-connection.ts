import 'dotenv/config';

import { getConfig } from '../config.js';
import { createDatabase } from './client.js';

const config = getConfig(process.env);
const { checkConnection, closeConnection } = createDatabase(config.databaseUrl);

try {
  await checkConnection();
  console.log('Database connection successful');
} finally {
  await closeConnection();
}
