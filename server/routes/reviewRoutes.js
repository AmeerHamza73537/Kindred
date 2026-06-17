import { Router } from 'express';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import * as r from '../controllers/reviewController.js';

const router = Router();

router.post('/', protect, r.createReview);
router.get('/eligible/:userId', protect, r.reviewable);
router.get('/user/:userId', optionalAuth, r.received);
router.get('/request/:requestId', protect, r.forRequest);

export default router;
