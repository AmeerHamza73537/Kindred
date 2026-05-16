import { Router } from 'express';
import * as auth from '../controllers/authController.js';

const router = Router();

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/logout', auth.logout);
router.post('/refresh-token', auth.refreshToken);

export default router;
