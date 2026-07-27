//  GET /api/health  — Server and database status

import { Router } from 'express';
import { getDbStatus } from '../db/connection.mjs';
import config from '../config/index.mjs';

const router = Router();
const startTime = Date.now();

router.get('/', (req, res) => {
    const db = getDbStatus();
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

    res.json({
        status: db.connected ? 'healthy' : 'degraded',
        uptime: `${uptimeSeconds}s`,
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        database: {
            connected: db.connected,
            host: db.host,
            name: db.name,
        },
        memory: {
            heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
        },
    });
});

export default router;
