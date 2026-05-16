import { Router } from 'express';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';
import * as u from '../controllers/userController.js';

const router = Router();

router.get('/me', protect, u.getMe);
router.put('/me', protect, uploadSingle, u.updateMe);
router.get('/nearby', optionalAuth, u.getNearbyUsers);
router.get('/:id', u.getUserById);

export default router;
