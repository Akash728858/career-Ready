/**
 * Resume routes
 */
import express from 'express';
import * as resumeController from '../controllers/resumeController.js';
import { requireAuth } from '../../common/middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.get('/', resumeController.list);
router.get('/:id', resumeController.getOne);
router.post('/', resumeController.create);
router.put('/:id', resumeController.update);
router.delete('/:id', resumeController.remove);

export default router;
