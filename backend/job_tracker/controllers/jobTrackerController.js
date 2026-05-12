/**
 * Job Tracker controller
 */
import * as jobTrackerService from '../services/jobTrackerService.js';
import { JOBS_DATA } from '../data/jobs.js';

export function getJobs(req, res) {
  try {
    const jobs = jobTrackerService.getJobsWithScores(req.userId, req.query);
    const locations = [...new Set(JOBS_DATA.map(j => j.location))].sort();
    res.json({ jobs, locations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function getSaved(req, res) {
  try {
    const jobs = jobTrackerService.getSavedJobs(req.userId);
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function getPreferences(req, res) {
  try {
    const preferences = jobTrackerService.getPreferences(req.userId);
    res.json({ preferences: preferences || {} });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function savePreferences(req, res) {
  try {
    jobTrackerService.savePreferences(req.userId, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export function toggleSave(req, res) {
  try {
    const { jobId } = req.params;
    const saved = jobTrackerService.toggleSaveJob(req.userId, parseInt(jobId, 10));
    res.json({ saved });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export function setStatus(req, res) {
  try {
    const { jobId } = req.params;
    const { status } = req.body;
    if (!['Not Applied', 'Applied', 'Rejected', 'Selected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    jobTrackerService.setJobStatus(req.userId, parseInt(jobId, 10), status);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export function generateDigest(req, res) {
  try {
    const digest = jobTrackerService.getDigest(req.userId);
    if (!digest) return res.status(400).json({ error: 'Set preferences first or no matching jobs' });
    res.json(digest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function getDigest(req, res) {
  try {
    const digest = jobTrackerService.getStoredDigest(req.userId);
    res.json(digest || { date: null, jobs: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
