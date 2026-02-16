/**
 * Career Platform - Express app
 */
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './auth/routes/authRoutes.js';
import resumeRoutes from './resume/routes/resumeRoutes.js';
import jobTrackerRoutes from './job_tracker/routes/jobTrackerRoutes.js';
import placementPrepRoutes from './placement_prep/routes/placementPrepRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/job-tracker', jobTrackerRoutes);
app.use('/api/placement-prep', placementPrepRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Career Platform API' });
});

// Serve frontend build in production
const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendPath, 'index.html'));
});

export default app;
