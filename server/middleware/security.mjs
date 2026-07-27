import helmet from 'helmet';
import cors from 'cors';
import express from 'express';
import config from '../config/index.mjs';

export function securityMiddleware() {
    return [
        helmet({
            contentSecurityPolicy: false, //Disabled inline scripts/styles
            crossOriginEmbedderPolicy: false,
            crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
        }),
        cors({
            origin: config.corsOrigin,
            credentials: true,
        }),

        express.json({ limit: '10mb' }),
    ];
}
