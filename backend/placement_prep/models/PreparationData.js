/**
 * Preparation/analysis data model
 */
import db from '../../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export function createPreparation(userId, payload) {
  const id = `analysis-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const stmt = db.prepare(`
    INSERT INTO preparation_data (id, user_id, company, role, jd_text, extracted_skills, checklist, plan, questions, readiness_score, company_intel, round_mapping)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    id, userId,
    payload.company || '',
    payload.role || '',
    payload.jdText || '',
    JSON.stringify(payload.extractedSkills || {}),
    JSON.stringify(payload.checklist || []),
    JSON.stringify(payload.plan || []),
    JSON.stringify(payload.questions || []),
    payload.readinessScore || 0,
    payload.companyIntel ? JSON.stringify(payload.companyIntel) : null,
    payload.roundMapping ? JSON.stringify(payload.roundMapping) : null
  );
  return getPreparationById(id);
}

export function getPreparationById(id) {
  const row = db.prepare('SELECT * FROM preparation_data WHERE id = ?').get(id);
  if (!row) return null;
  return normalizeRow(row);
}

export function getPreparationsByUserId(userId) {
  const rows = db.prepare('SELECT id, created_at, company, role, readiness_score FROM preparation_data WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  return rows.map(r => ({ id: r.id, createdAt: r.created_at, company: r.company, role: r.role, readinessScore: r.readiness_score }));
}

function normalizeRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    company: row.company,
    role: row.role,
    jdText: row.jd_text,
    extractedSkills: row.extracted_skills ? JSON.parse(row.extracted_skills) : {},
    checklist: row.checklist ? JSON.parse(row.checklist) : [],
    plan: row.plan ? JSON.parse(row.plan) : [],
    questions: row.questions ? JSON.parse(row.questions) : [],
    readinessScore: row.readiness_score,
    companyIntel: row.company_intel ? JSON.parse(row.company_intel) : null,
    roundMapping: row.round_mapping ? JSON.parse(row.round_mapping) : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
