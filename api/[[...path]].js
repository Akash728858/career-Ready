/**
 * Vercel serverless handler - forwards all /api/* to Express backend.
 * Uses /tmp for SQLite on serverless (ephemeral; data resets on cold start).
 */
if (!process.env.DATABASE_PATH) {
  process.env.DATABASE_PATH = '/tmp/career_platform.db';
}

import app from '../backend/app.js';
import { initDatabase } from '../backend/database/init.js';

let inited = false;
function ensureDb() {
  if (!inited) {
    initDatabase();
    inited = true;
  }
}

export default function handler(req, res) {
  ensureDb();
  return app(req, res);
}
