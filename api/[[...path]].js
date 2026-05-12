/**
 * Vercel serverless — forwards /api/* to Express.
 *
 * Vercel often passes either:
 * - full path `/api/auth/login`, or
 * - catch-all segments in `req.query.path` (from `api/[[...path]].js`) with a shortened `req.url`, or
 * - path without `/api` prefix (e.g. `/auth/login`).
 * Any mismatch yields Express 404 with plain text → UI showed "Request failed".
 */
import app from '../backend/app.js';
import { initDatabase } from '../backend/database/init.js';

function splitUrl(url) {
  const u = url || '/';
  const q = u.indexOf('?');
  if (q === -1) return { pathname: u, search: '' };
  return { pathname: u.slice(0, q), search: u.slice(q) };
}

function normalizeVercelRequestUrl(req) {
  let url = req.url || '/';
  if (url.includes('://')) {
    try {
      const u = new URL(url, 'http://localhost');
      url = u.pathname + u.search;
    } catch {
      /* keep */
    }
  }

  let { pathname, search } = splitUrl(url);

  if (pathname.startsWith('/api')) {
    req.url = pathname + search;
    return;
  }

  const qPath = req.query?.path;
  if (qPath !== undefined && qPath !== '') {
    const segments = Array.isArray(qPath) ? qPath.join('/') : String(qPath);
    req.url = '/api/' + segments.replace(/^\/+/, '') + search;
    if (typeof req.originalUrl === 'string') req.originalUrl = req.url;
    return;
  }

  if (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/resumes') ||
    pathname.startsWith('/job-tracker') ||
    pathname.startsWith('/placement-prep') ||
    pathname === '/health'
  ) {
    req.url = '/api' + pathname + search;
    if (typeof req.originalUrl === 'string') req.originalUrl = req.url;
  }
}

export default async function handler(req, res) {
  normalizeVercelRequestUrl(req);
  try {
    await initDatabase();
  } catch (err) {
    console.error('[api] initDatabase', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: err?.message || 'Database initialization failed' });
    }
    return;
  }
  return app(req, res);
}
