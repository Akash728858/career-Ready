/**
 * Job Tracker service - match scoring, preferences, saved jobs, status, digest
 */
import db from '../../config/database.js';
import { JOBS_DATA } from '../data/jobs.js';

export function calculateMatchScore(job, preferences) {
  if (!preferences) return 0;
  let score = 0;
  const roleKeywords = (preferences.roleKeywords || '').split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
  const userSkills = (preferences.skills || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const preferredLocations = preferences.preferredLocations || [];
  const preferredModes = preferences.preferredMode || [];
  const experienceLevel = preferences.experienceLevel || '';

  if (roleKeywords.length) {
    const titleLower = job.title.toLowerCase();
    if (roleKeywords.some(k => titleLower.includes(k))) score += 25;
  }
  if (roleKeywords.length) {
    const descLower = (job.description || '').toLowerCase();
    if (roleKeywords.some(k => descLower.includes(k))) score += 15;
  }
  if (preferredLocations.length && preferredLocations.includes(job.location)) score += 15;
  if (preferredModes.length && preferredModes.includes(job.mode)) score += 10;
  if (experienceLevel && job.experience === experienceLevel) score += 10;
  if (userSkills.length && job.skills?.length) {
    const jobSkillsLower = job.skills.map(s => s.toLowerCase());
    if (userSkills.some(s => jobSkillsLower.includes(s))) score += 15;
  }
  if (job.postedDaysAgo <= 2) score += 5;
  if (job.source === 'LinkedIn') score += 5;
  return Math.min(100, score);
}

export function getSavedJobIds(userId) {
  const stmt = db.prepare('SELECT job_id FROM saved_jobs WHERE user_id = ?');
  const rows = stmt.all(userId);
  return new Set(rows.map(r => r.job_id));
}

export function getJobStatusMap(userId) {
  const stmt = db.prepare('SELECT job_id, status FROM job_status WHERE user_id = ?');
  const rows = stmt.all(userId);
  const map = {};
  rows.forEach(r => { map[r.job_id] = r.status; });
  return map;
}

export function getPreferences(userId) {
  const stmt = db.prepare('SELECT preferences FROM job_preferences WHERE user_id = ?');
  const row = stmt.get(userId);
  return row ? JSON.parse(row.preferences) : null;
}

export function savePreferences(userId, preferences) {
  const stmt = db.prepare(`
    INSERT INTO job_preferences (user_id, preferences, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET preferences = excluded.preferences, updated_at = datetime('now')
  `);
  stmt.run(userId, JSON.stringify(preferences));
}

export function toggleSaveJob(userId, jobId) {
  const existing = db.prepare('SELECT 1 FROM saved_jobs WHERE user_id = ? AND job_id = ?').get(userId, jobId);
  if (existing) {
    db.prepare('DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?').run(userId, jobId);
    return false;
  }
  db.prepare('INSERT INTO saved_jobs (user_id, job_id) VALUES (?, ?)').run(userId, jobId);
  return true;
}

export function setJobStatus(userId, jobId, status) {
  const upd = db.prepare('UPDATE job_status SET status = ? WHERE user_id = ? AND job_id = ?');
  const res = upd.run(status, userId, jobId);
  if (res.changes === 0) {
    const ins = db.prepare('INSERT INTO job_status (user_id, job_id, status) VALUES (?, ?, ?)');
    ins.run(userId, jobId, status);
  }
}

export function getJobsWithScores(userId, filters = {}) {
  const preferences = getPreferences(userId);
  const statusMap = getJobStatusMap(userId);
  const savedIds = getSavedJobIds(userId);

  let jobs = JOBS_DATA.map(job => ({
    ...job,
    matchScore: calculateMatchScore(job, preferences),
    status: statusMap[job.id] || 'Not Applied',
    saved: savedIds.has(job.id),
  }));

  const { keyword, location, mode, experience, source, status: statusFilter, matchesOnly, minMatchScore, sort } = filters;

  if (keyword) {
    const k = keyword.toLowerCase();
    jobs = jobs.filter(j => j.title.toLowerCase().includes(k) || j.company.toLowerCase().includes(k));
  }
  if (location) jobs = jobs.filter(j => j.location === location);
  if (mode) jobs = jobs.filter(j => j.mode === mode);
  if (experience) jobs = jobs.filter(j => j.experience === experience);
  if (source) jobs = jobs.filter(j => j.source === source);
  if (statusFilter) jobs = jobs.filter(j => j.status === statusFilter);
  if (matchesOnly && preferences) {
    const min = minMatchScore ?? preferences.minMatchScore ?? 40;
    jobs = jobs.filter(j => j.matchScore >= min);
  }

  const sortBy = sort || 'latest';
  if (sortBy === 'latest') jobs.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
  else if (sortBy === 'oldest') jobs.sort((a, b) => b.postedDaysAgo - a.postedDaysAgo);
  else if (sortBy === 'match-score') jobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  else if (sortBy === 'salary-high') jobs.sort((a, b) => (parseInt((b.salaryRange || '').match(/(\d+)/)?.[1]) || 0) - (parseInt((a.salaryRange || '').match(/(\d+)/)?.[1]) || 0));
  else if (sortBy === 'salary-low') jobs.sort((a, b) => (parseInt((a.salaryRange || '').match(/(\d+)/)?.[1]) || 0) - (parseInt((b.salaryRange || '').match(/(\d+)/)?.[1]) || 0));

  return jobs;
}

export function getSavedJobs(userId) {
  return getJobsWithScores(userId).filter(j => j.saved);
}

export function getDigest(userId) {
  const preferences = getPreferences(userId);
  const hasPrefs = preferences && (preferences.roleKeywords || (preferences.preferredLocations?.length > 0));
  if (!hasPrefs) return null;

  const jobs = getJobsWithScores(userId).slice(0, 10);
  if (jobs.length === 0) return null;

  const dateStr = new Date().toISOString().slice(0, 10);
  const payload = { date: dateStr, jobs };

  const stmt = db.prepare(`
    INSERT INTO digest_cache (user_id, digest_date, jobs) VALUES (?, ?, ?)
    ON CONFLICT(user_id, digest_date) DO UPDATE SET jobs = excluded.jobs
  `);
  stmt.run(userId, dateStr, JSON.stringify(jobs));

  return payload;
}

export function getStoredDigest(userId) {
  const dateStr = new Date().toISOString().slice(0, 10);
  const row = db.prepare('SELECT jobs FROM digest_cache WHERE user_id = ? AND digest_date = ?').get(userId, dateStr);
  if (!row) return null;
  return { date: dateStr, jobs: JSON.parse(row.jobs) };
}
