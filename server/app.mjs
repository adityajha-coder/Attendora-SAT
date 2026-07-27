import express from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import config from './config/index.mjs';
import { securityMiddleware } from './middleware/security.mjs';
import { googleCallback } from './controllers/auth.controller.mjs';
import { globalErrorHandler, asyncHandler } from './middleware/error-handler.mjs';

// Routes
import authRoutes from './routes/auth.routes.mjs';
import dataRoutes from './routes/data.routes.mjs';
import scanRoutes from './routes/scan.routes.mjs';
import healthRoutes from './routes/health.routes.mjs';
import notificationRoutes from './routes/notification.routes.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(compression());
app.use(cookieParser());
app.use(...securityMiddleware());

app.get('/api/config', (req, res) => {
    res.json({
        googleClientId: config.googleClientId,
        vapidPublicKey: config.vapidPublicKey,
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(express.static(path.join(__dirname, '..'), {
    maxAge: '1d',
    etag: true,
    lastModified: true,
}));

app.use((req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.use(globalErrorHandler);

export default app;
