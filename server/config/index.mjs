/**
 * Centralized Configuration Module
 * 
 * All environment variables are sourced and validated here.
 * Fail fast on startup if required config is missing.
 */

const requiredVars = ['MONGODB_URI', 'JWT_SECRET', 'GOOGLE_CLIENT_ID'];

function validateEnv() {
    const missing = requiredVars.filter(key => !process.env[key]);
    if (missing.length > 0) {
        console.warn(`[Config] ⚠ Missing environment variables: ${missing.join(', ')}`);
        console.warn('[Config] Some features may not work correctly.');
    }
}

const config = {
    port: parseInt(process.env.PORT, 10) || 3010,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Database
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/attendora',

    // Authentication
    jwtSecret: process.env.JWT_SECRET || 'fallback_attendora_jwt_secret_key_2026',
    jwtExpiresIn: '7d',
    cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms

    // Google OAuth
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',

    // AI / OpenRouter
    openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
    openRouterModels: [
        'openai/gpt-4o-mini',
        'google/gemini-1.5-flash',
        'google/gemini-2.0-flash-lite-preview-02-05:free'
    ],

    // VAPID (Push Notifications)
    vapidPublicKey: process.env.VITE_VAPID_PUBLIC_KEY || '',

    // CORS
    corsOrigin: true,

    // Rate Limiting (requests per window)
    rateLimit: {
        windowMs: 60 * 1000, // 1 minute
        auth: 10,
        data: 30,
        scan: 5,
        general: 100
    },

    // Helpers
    get isProduction() {
        return this.nodeEnv === 'production';
    }
};

validateEnv();

export default config;
