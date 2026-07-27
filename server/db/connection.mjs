import mongoose from 'mongoose';
import config from '../config/index.mjs';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

// Connect to MongoDB with exponential backoff retry.
export async function connectDatabase() {
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
        return;
    }
    let retries = 0;

    while (retries < MAX_RETRIES) {
        try {
            await mongoose.connect(config.mongoUri, {
                serverSelectionTimeoutMS: 5000,
                heartbeatFrequencyMS: 10000,
            });
            console.log('[DB] ✓ Connected to MongoDB successfully.');
            _registerConnectionEvents();
            return;
        } catch (err) {
            retries++;
            const delay = RETRY_DELAY_MS * retries;
            console.error(`[DB] Connection attempt ${retries}/${MAX_RETRIES} failed: ${err.message}`);
            if (retries < MAX_RETRIES) {
                console.log(`[DB] Retrying in ${delay / 1000}s...`);
                await _sleep(delay);
            }
        }
    }

    console.error('[DB] ✗ Failed to connect after maximum retries. Server will run without database.');
}

// Get database connection health status.
export function getDbStatus() {
    const conn = mongoose.connection;
    return {
        connected: conn.readyState === 1,
        readyState: conn.readyState,
        host: conn.host || 'N/A',
        name: conn.name || 'N/A',
    };
}

export function isDbConnected() {
    return mongoose.connection.readyState === 1;
}

export async function closeDatabase() {
    try {
        await mongoose.connection.close();
        console.log('[DB] Connection closed gracefully.');
    } catch (err) {
        console.error('[DB] Error closing connection:', err.message);
    }
}

function _registerConnectionEvents() {
    const conn = mongoose.connection;

    conn.on('disconnected', () => {
        console.warn('[DB] ⚠ MongoDB disconnected.');
    });

    conn.on('reconnected', () => {
        console.log('[DB] ✓ MongoDB reconnected.');
    });

    conn.on('error', (err) => {
        console.error('[DB] Connection error:', err.message);
    });
}

function _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
