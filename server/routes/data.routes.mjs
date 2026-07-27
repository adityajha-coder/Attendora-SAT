// GET /api/data  — Fetch user's academic data
// PUT /api/data  — Save/sync user's academic data

import { Router } from 'express';
import { getUserData, saveUserData } from '../controllers/data.controller.mjs';
import { authenticateToken } from '../middleware/auth.mjs';
import { asyncHandler } from '../middleware/error-handler.mjs';
import { dataLimiter } from '../middleware/rate-limiter.mjs';

const router = Router();

router.use(authenticateToken); // All data routes require auth
router.use(dataLimiter);

router.get('/', asyncHandler(getUserData));
router.put('/', asyncHandler(saveUserData));

export default router;
