/**
 * Career Platform - Server entry point
 */
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';
import { initDatabase } from './database/init.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5000;

initDatabase();

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', 'career_platform.db');
app.listen(PORT, () => {
  console.log(`Career Platform API running at http://localhost:${PORT}`);
  console.log(`API base: http://localhost:${PORT}/api`);
  console.log(`SQLite database: ${path.resolve(dbPath)}`);
});
