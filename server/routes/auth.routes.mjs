
//  POST /api/auth/google  — Google OAuth login
//  GET  /api/auth/me      — Get current user
//  POST /api/auth/logout   — Logout

import { Router } from 'express';
import { googleLogin, googleCallback, getCurrentUser, logout } from '../controllers/auth.controller.mjs';
import { authenticateToken } from '../middleware/auth.mjs';
import { asyncHandler } from '../middleware/error-handler.mjs';
import { authLimiter } from '../middleware/rate-limiter.mjs';

const router = Router();

router.post('/google', authLimiter, asyncHandler(googleLogin));
router.post('/google/callback', authLimiter, asyncHandler(googleCallback));
router.get('/google/callback', authLimiter, asyncHandler(googleCallback));
router.get('/me', authenticateToken, asyncHandler(getCurrentUser));
router.post('/logout', logout);

export default router;
