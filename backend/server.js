/**
 * Career Platform - Server entry point
 */
import 'dotenv/config';
import app from './app.js';
import { initDatabase } from './database/init.js';

const PORT = process.env.PORT || 5000;

initDatabase();

app.listen(PORT, () => {
  console.log(`Career Platform API running at http://localhost:${PORT}`);
  console.log(`API base: http://localhost:${PORT}/api`);
});
