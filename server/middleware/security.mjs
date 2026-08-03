import helmet from 'helmet';
import cors from 'cors';
import express from 'express';
import config from '../config/index.mjs';

export function securityMiddleware() {
    return [
        helmet({
            contentSecurityPolicy: false, //Disabled inline scripts/styles
            crossOriginEmbedderPolicy: false,
            crossOriginOpenerPolicy: false,
        }),
        cors({
            origin: config.corsOrigin,
            credentials: true,
        }),

        express.json({ limit: '10mb' }),
        express.urlencoded({ extended: true, limit: '10mb' }),
    ];
}
