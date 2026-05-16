import { Router } from 'express';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import * as g from '../controllers/gratitudeController.js';

const router = Router();

router.post('/', protect, g.createGratitude);
router.get('/received/:userId', optionalAuth, g.received);
router.get('/sent/:userId', protect, g.sent);

export default router;
