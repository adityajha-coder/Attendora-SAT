/* 
   SECURE FIREBASE INITIALIZER
   Uses Top-Level Await to bridge the configuration from the backend 
   via the serverless bridge in api/config.js. 
   This keeps your keys 100% out of your public GitHub code!
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// Step 1: Securely fetch from the Bridge (localhost during dev, Vercel during prod)
const response = await fetch('/api/config');
const firebaseConfig = await response.json();

// Step 2: Initialize with the bridge config
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
