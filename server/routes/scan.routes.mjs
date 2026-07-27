// POST /api/scan  — AI timetable image scanning

import { Router } from 'express';
import { scanTimetable } from '../controllers/scan.controller.mjs';
import { asyncHandler } from '../middleware/error-handler.mjs';
import { scanLimiter } from '../middleware/rate-limiter.mjs';

const router = Router();

router.post('/', scanLimiter, asyncHandler(scanTimetable));

export default router;