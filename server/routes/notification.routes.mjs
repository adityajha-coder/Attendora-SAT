import { Router } from 'express';
import { subscribe, unsubscribe, getVapidPublicKey } from '../controllers/notification.controller.mjs';
import { authenticateToken } from '../middleware/auth.mjs';
import { asyncHandler } from '../middleware/error-handler.mjs';

const router = Router();

router.get('/vapid-key', getVapidPublicKey);
router.post('/subscribe', authenticateToken, asyncHandler(subscribe));
router.post('/unsubscribe', authenticateToken, asyncHandler(unsubscribe));

export default router;
