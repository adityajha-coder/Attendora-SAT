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

    // Clerk Authentication
    clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY || '',
    clerkSecretKey: process.env.CLERK_SECRET_KEY || '',

    // Google OAuth
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',

    // AI Scanner
    openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
    openRouterModels: [
        'openai/gpt-4o-mini',
        'google/gemini-1.5-flash',
        'google/gemini-2.0-flash-lite-preview-02-05:free'
    ],

    vapidPublicKey: process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY || '',
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || '',
    vapidSubject: process.env.VAPID_SUBJECT || 'mailto:support@attendora-sat.vercel.app',

    corsOrigin: true,

    rateLimit: {
        windowMs: 60 * 1000, // 1 minute
        auth: 10,
        data: 30,
        scan: 5,
        general: 100
    },

    get isProduction() {
        return this.nodeEnv === 'production';
    }
};

validateEnv();

export default config;
