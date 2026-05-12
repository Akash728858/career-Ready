/**
 * Resume model
 */
import db from '../../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export function createResume(userId, data, name = 'My Resume', template = 'classic', color = 'teal') {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO resumes (id, user_id, name, data, template, color)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, userId, name, JSON.stringify(data), template, color);
  return getResumeById(id);
}

export function getResumeById(id) {
  const stmt = db.prepare('SELECT * FROM resumes WHERE id = ?');
  const row = stmt.get(id);
  if (!row) return null;
  return { ...row, data: JSON.parse(row.data || '{}') };
}

export function getResumesByUserId(userId) {
  const stmt = db.prepare('SELECT * FROM resumes WHERE user_id = ? ORDER BY updated_at DESC');
  const rows = stmt.all(userId);
  return rows.map((r) => ({ ...r, data: JSON.parse(r.data || '{}') }));
}

export function updateResume(id, userId, updates) {
  const existing = getResumeById(id);
  if (!existing || existing.user_id !== userId) return null;

  const { name, data, template, color } = updates;
  const stmt = db.prepare(`
    UPDATE resumes SET
      name = COALESCE(?, name),
      data = COALESCE(?, data),
      template = COALESCE(?, template),
      color = COALESCE(?, color),
      updated_at = datetime('now')
    WHERE id = ?
  `);
  stmt.run(
    name ?? existing.name,
    data ? JSON.stringify(data) : existing.data,
    template ?? existing.template,
    color ?? existing.color,
    id
  );
  return getResumeById(id);
}

export function deleteResume(id, userId) {
  const existing = getResumeById(id);
  if (!existing || existing.user_id !== userId) return false;
  const stmt = db.prepare('DELETE FROM resumes WHERE id = ?');
  stmt.run(id);
  return true;
}
