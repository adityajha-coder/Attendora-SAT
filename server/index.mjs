
import app from './app.mjs';
import config from './config/index.mjs';
import { connectDatabase, closeDatabase } from './db/connection.mjs';

let server;

async function start() {

    await connectDatabase();

    server = app.listen(config.port, () => {
        console.log(`\n Attendora Server running at http://localhost:${config.port}`);
        console.log(`   Environment: ${config.nodeEnv}`);
        console.log(`   Health check: http://localhost:${config.port}/api/health\n`);
    });
}

async function shutdown(signal) {
    console.log(`\n[Shutdown] ${signal} received. Shutting down gracefully...`);

    // Stop accepting new connections
    if (server) {
        server.close(() => {
            console.log('[Shutdown] HTTP server closed.');
        });
    }

    await closeDatabase();

    console.log('[Shutdown] Cleanup complete. Exiting.');
    process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
    console.error('[Fatal] Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('[Fatal] Uncaught Exception:', err);
    process.exit(1);
});

start();
