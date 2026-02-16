/**
 * Placement Prep routes
 */
import express from 'express';
import * as placementPrepController from '../controllers/placementPrepController.js';
import { requireAuth } from '../../common/middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.post('/analyze', placementPrepController.analyze);
router.get('/preparations', placementPrepController.list);
router.get('/preparations/:id', placementPrepController.getOne);

export default router;
