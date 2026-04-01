/* 
   FIREBASE INITIALIZER
   Tries the secure API bridge first (for Vercel production).
   Falls back to the local config file (for local development).
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let firebaseConfig;

try {
    // Try the secure API bridge first (works on Vercel)
    const response = await fetch('/api/config');
    if (!response.ok) throw new Error('API bridge unavailable');
    firebaseConfig = await response.json();
    
    // Verify the config has required fields
    if (!firebaseConfig.apiKey) throw new Error('Invalid config from API');
} catch (e) {
    // Fall back to local config file (works with any local server)
    console.info('[Firebase] API bridge unavailable, using local config.');
    const { firebaseConfig: localConfig } = await import('./firebase-config.js');
    firebaseConfig = localConfig;
}

const app = initializeApp(firebaseConfig);

let analytics = null;
try {
    analytics = getAnalytics(app);
} catch (e) {
    // Analytics may fail on localhost
    console.info('[Firebase] Analytics not available in this environment.');
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
