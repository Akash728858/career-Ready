/**
 * Vercel serverless handler — forwards /api/* to Express.
 * On Vercel, VERCEL=1: backend uses sql.js (no native better-sqlite3). DB is in-memory per instance.
 */
import app from '../backend/app.js';
import { initDatabase } from '../backend/database/init.js';

export default async function handler(req, res) {
  await initDatabase();
  return app(req, res);
}
