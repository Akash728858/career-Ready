/**
 * Resume service
 */
import * as resumeModel from '../models/Resume.js';

const defaultData = {
  personal: { name: '', email: '', phone: '', location: '' },
  summary: '',
  education: [],
  experience: [],
  projects: [],
  skills: { technical: [], soft: [], tools: [] },
  links: { github: '', linkedin: '' },
};

export function createResume(userId, payload = {}) {
  const data = payload.data ?? defaultData;
  const name = payload.name ?? 'My Resume';
  const template = payload.template ?? 'classic';
  const color = payload.color ?? 'teal';
  return resumeModel.createResume(userId, data, name, template, color);
}

export function getResumes(userId) {
  return resumeModel.getResumesByUserId(userId);
}

export function getResume(id, userId) {
  const r = resumeModel.getResumeById(id);
  if (!r || r.user_id !== userId) return null;
  return r;
}

export function updateResume(id, userId, payload) {
  return resumeModel.updateResume(id, userId, payload);
}

export function deleteResume(id, userId) {
  return resumeModel.deleteResume(id, userId);
}
