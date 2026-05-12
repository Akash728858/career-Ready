/**
 * Job Tracker routes
 */
import express from 'express';
import * as jobTrackerController from '../controllers/jobTrackerController.js';
import { requireAuth } from '../../common/middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.get('/jobs', jobTrackerController.getJobs);
router.get('/saved', jobTrackerController.getSaved);
router.get('/preferences', jobTrackerController.getPreferences);
router.post('/preferences', jobTrackerController.savePreferences);
router.post('/saved/:jobId', jobTrackerController.toggleSave);
router.put('/status/:jobId', jobTrackerController.setStatus);
router.post('/digest/generate', jobTrackerController.generateDigest);
router.get('/digest', jobTrackerController.getDigest);

export default router;
