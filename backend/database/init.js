/**
 * Initialize database schema
 */
import db from '../config/database.js';

export function initDatabase() {
  // Users
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Resumes (multiple per user)
  db.exec(`
    CREATE TABLE IF NOT EXISTS resumes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT DEFAULT 'My Resume',
      data TEXT NOT NULL,
      template TEXT DEFAULT 'classic',
      color TEXT DEFAULT 'teal',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Job applications (user's own tracked jobs)
  db.exec(`
    CREATE TABLE IF NOT EXISTS job_applications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      job_id INTEGER,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT DEFAULT '',
      mode TEXT DEFAULT '',
      experience TEXT DEFAULT '',
      salary_range TEXT DEFAULT '',
      source TEXT DEFAULT '',
      apply_url TEXT DEFAULT '',
      description TEXT DEFAULT '',
      skills TEXT,
      status TEXT DEFAULT 'Not Applied',
      resume_id TEXT REFERENCES resumes(id),
      notes TEXT DEFAULT '',
      applied_date TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Saved job IDs (references jobs from seed data)
  db.exec(`
    CREATE TABLE IF NOT EXISTS saved_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      job_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, job_id)
    )
  `);

  // Job status per user per job
  db.exec(`
    CREATE TABLE IF NOT EXISTS job_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      job_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, job_id)
    )
  `);

  // User preferences (job tracker)
  db.exec(`
    CREATE TABLE IF NOT EXISTS job_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
      preferences TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Preparation/analysis data
  db.exec(`
    CREATE TABLE IF NOT EXISTS preparation_data (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      company TEXT DEFAULT '',
      role TEXT DEFAULT '',
      jd_text TEXT DEFAULT '',
      extracted_skills TEXT,
      checklist TEXT,
      plan TEXT,
      questions TEXT,
      readiness_score INTEGER DEFAULT 0,
      company_intel TEXT,
      round_mapping TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Digest cache (per user per day)
  db.exec(`
    CREATE TABLE IF NOT EXISTS digest_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      digest_date TEXT NOT NULL,
      jobs TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, digest_date)
    )
  `);

  return db;
}
