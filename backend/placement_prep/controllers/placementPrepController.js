/**
 * Placement Prep controller
 */
import * as placementPrepService from '../services/placementPrepService.js';

export function analyze(req, res) {
  try {
    const { company, role, jdText } = req.body;
    const trimmed = (jdText || '').trim();
    if (!trimmed) return res.status(400).json({ error: 'Please paste a job description.' });
    const entry = placementPrepService.analyzeJD(req.userId, (company || '').trim(), (role || '').trim(), trimmed);
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function list(req, res) {
  try {
    const list = placementPrepService.getPreparations(req.userId);
    res.json({ list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function getOne(req, res) {
  try {
    const entry = placementPrepService.getPreparation(req.params.id, req.userId);
    if (!entry) return res.status(404).json({ error: 'Analysis not found' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
