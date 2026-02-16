/**
 * Placement Prep service
 */
import { runAnalysis } from '../utils/analysis.js';
import * as prepModel from '../models/PreparationData.js';

export function analyzeJD(userId, company, role, jdText) {
  const result = runAnalysis(jdText, company, role);
  const entry = prepModel.createPreparation(userId, {
    company,
    role,
    jdText,
    ...result,
  });
  return entry;
}

export function getPreparations(userId) {
  return prepModel.getPreparationsByUserId(userId);
}

export function getPreparation(id, userId) {
  const p = prepModel.getPreparationById(id);
  if (!p || p.userId !== userId) return null;
  return p;
}
