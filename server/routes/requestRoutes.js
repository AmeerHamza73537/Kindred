import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as r from '../controllers/requestController.js';

const router = Router();

router.post('/', protect, r.createRequest);
router.get('/incoming', protect, r.incoming);
router.get('/outgoing', protect, r.outgoing);
router.get('/:id', protect, r.getRequest);
router.patch('/:id/approve', protect, r.approve);
router.patch('/:id/reject', protect, r.reject);
router.patch('/:id/cancel', protect, r.cancel);

export default router;
