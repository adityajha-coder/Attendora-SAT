export default function handler(request, response) {
    // Only return the PUBLIC Firebase configuration
    // This serverless function reads from your secure Vercel environment variables
    const config = {
        apiKey: process.env.VITE_FIREBASE_API_KEY,
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.VITE_FIREBASE_APP_ID,
        measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
    };
    
    // Check if any keys are missing and log locally (won't show in browser)
    const missing = Object.keys(config).filter(k => !config[k]);
    if (missing.length > 0) {
        console.warn(`[Config Bridge] Missing environment variables: ${missing.join(', ')}`);
    }

    return response.status(200).json(config);
}
