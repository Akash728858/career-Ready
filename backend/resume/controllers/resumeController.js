/**
 * Resume controller
 */
import * as resumeService from '../services/resumeService.js';

export function list(req, res) {
  try {
    const resumes = resumeService.getResumes(req.userId);
    res.json({ resumes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function getOne(req, res) {
  try {
    const resume = resumeService.getResume(req.params.id, req.userId);
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json(resume);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function create(req, res) {
  try {
    const resume = resumeService.createResume(req.userId, req.body);
    res.status(201).json(resume);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export function update(req, res) {
  try {
    const resume = resumeService.updateResume(req.params.id, req.userId, req.body);
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json(resume);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export function remove(req, res) {
  try {
    const ok = resumeService.deleteResume(req.params.id, req.userId);
    if (!ok) return res.status(404).json({ error: 'Resume not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
