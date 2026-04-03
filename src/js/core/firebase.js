/* 
   FIREBASE INITIALIZER
   Tries the secure API bridge first (for Vercel production).
   Falls back to the local config file (for local development).
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let firebaseConfig;

try {
    // Try the secure API bridge first (works on Vercel)
    // Only attempt bridge if not on localhost
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        const response = await fetch('/api/config');
        if (response.ok) {
            firebaseConfig = await response.json();
            if (!firebaseConfig.apiKey) throw new Error('Invalid config');
        } else {
            throw new Error('API bridge unavailable');
        }
    } else {
        throw new Error('Localhost environment');
    }
} catch (e) {
    // Fall back to local config file (works with any local server)
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
const googleProvider = new GoogleAuthProvider();

export { app, analytics, auth, db, googleProvider };
