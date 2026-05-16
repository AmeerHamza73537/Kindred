import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as h from '../controllers/handoffController.js';

const router = Router();

router.post('/:requestId/initiate', protect, h.initiate);
router.get('/request/:requestId', protect, h.getByRequest);
router.get('/document/:id', protect, h.getById);
router.patch('/:id/set-pickup-details', protect, h.setPickupDetails);
router.patch('/:id/confirm-pickup', protect, h.confirmPickup);
router.patch('/:id/verify-code', protect, h.verifyCode);
router.patch('/:id/confirm-return', protect, h.confirmReturn);

export default router;
