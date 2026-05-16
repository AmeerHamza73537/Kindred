import { Router } from 'express';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { uploadImages } from '../middleware/uploadMiddleware.js';
import * as i from '../controllers/itemController.js';

const router = Router();

router.get('/', optionalAuth, i.listItems);
router.post('/', protect, uploadImages, i.createItem);
router.get('/borrowed', protect, i.getBorrowedItems);
router.get('/gifted', protect, i.getGiftedItems);
router.get('/:id', i.getItem);
router.put('/:id', protect, uploadImages, i.updateItem);
router.delete('/:id', protect, i.deleteItem);
router.patch('/:id/status', protect, i.patchStatus);
router.get('/:id/availability', i.getAvailability);
router.post('/:id/availability', protect, i.postAvailability);

export default router;
