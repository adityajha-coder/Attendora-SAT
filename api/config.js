module.exports = function handler(request, response) {
    const config = {
        supabaseUrl: process.env.VITE_SUPABASE_URL,
        supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY,
        googleClientId: process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '',
        vapidPublicKey: process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY || ''
    };
    
    // Check if any keys are missing and log locally (won't show in browser)
    const missing = Object.keys(config).filter(k => !config[k]);
    if (missing.length > 0) {
        console.warn(`[Config Bridge] Missing environment variables: ${missing.join(', ')}`);
    }

    return response.status(200).json(config);
};
