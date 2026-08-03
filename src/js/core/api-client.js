let googleClientId = '';
let clerkPublishableKey = '';
let vapidPublicKey = '';
let configPromise = null;

// Auth state cache to prevent repeated /api/auth/me calls when not logged in
let cachedUser = undefined; // undefined = not checked yet, null = not logged in, object = logged in
let cachedUserTimestamp = 0;
const AUTH_CACHE_TTL_MS = 30_000; // Re-check after 30s if not logged in

export function getApiUrl(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    const isStandaloneFile = window.location.protocol === 'file:';
    const baseUrl = isStandaloneFile ? 'https://attendora-sat.vercel.app' : '';
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    return baseUrl + cleanPath;
}

export async function getAuthHeaders(customHeaders = {}) {
    const headers = { ...customHeaders };
    if (window.Clerk?.session) {
        try {
            const token = await window.Clerk.session.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        } catch (err) {
            console.warn('[API Client] Failed to get Clerk session token:', err);
        }
    }
    return headers;
}

export async function loadApiConfig() {
    // Cache: only fetch once
    if (configPromise) return configPromise;

    configPromise = (async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            const response = await fetch(getApiUrl('/api/config'), { signal: controller.signal });
            clearTimeout(timeoutId);
            if (response.ok) {
                const config = await response.json();
                if (config.clerkPublishableKey) clerkPublishableKey = config.clerkPublishableKey;
                if (config.googleClientId) googleClientId = config.googleClientId;
                if (config.vapidPublicKey) vapidPublicKey = config.vapidPublicKey;
            }
        } catch (err) {
            console.error('[API Client] Failed to fetch config:', err);
        }
        return { clerkPublishableKey, googleClientId, vapidPublicKey };
    })();

    return configPromise;
}

export function getClerkPublishableKey() {
    return clerkPublishableKey;
}

// Clear auth cache (call after login/logout to force fresh check)
export function clearAuthCache() {
    cachedUser = undefined;
    cachedUserTimestamp = 0;
}

// Get Current Logged In User (with caching to avoid repeated 401s)
export async function getCurrentUser() {
    const now = Date.now();

    if (window.Clerk?.isReady && !window.Clerk?.user && !window.Clerk?.session) {
        cachedUser = null;
        cachedUserTimestamp = now;
        return null;
    }

    // Return cached result if still valid
    if (cachedUser !== undefined) {
        // If logged in, always return cached user (until cleared)
        if (cachedUser !== null) return cachedUser;
        // If not logged in, respect TTL before retrying
        if (now - cachedUserTimestamp < AUTH_CACHE_TTL_MS) return null;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const headers = await getAuthHeaders();
        const res = await fetch(getApiUrl('/api/auth/me'), {
            headers,
            credentials: 'include',
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!res.ok) {
            cachedUser = null;
            cachedUserTimestamp = now;
            return null;
        }
        const data = await res.json();
        cachedUser = data.user;
        cachedUserTimestamp = now;
        return data.user;
    } catch (err) {
        cachedUser = null;
        cachedUserTimestamp = now;
        return null;
    }
}

// Logout
export async function logoutUserApi() {
    const headers = await getAuthHeaders();
    await fetch(getApiUrl('/api/auth/logout'), { method: 'POST', headers, credentials: 'include' });
}

// Fetch Data from Cloud
export async function fetchUserData() {
    const headers = await getAuthHeaders();
    const res = await fetch(getApiUrl('/api/data'), { headers, credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch user data');
    const json = await res.json();
    return json.data;
}

// Save/Sync Data to Cloud
export async function saveUserData(dataPayload) {
    const headers = await getAuthHeaders({ 'Content-Type': 'application/json' });
    const res = await fetch(getApiUrl('/api/data'), {
        method: 'PUT',
        headers,
        body: JSON.stringify(dataPayload),
        credentials: 'include'
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Save failed' }));
        throw new Error(err.error || 'Failed to save user data');
    }

    return await res.json();
}

// Push Notifications — Subscribe
export async function subscribePushNotification(subscription) {
    const headers = await getAuthHeaders({ 'Content-Type': 'application/json' });
    const res = await fetch(getApiUrl('/api/notifications/subscribe'), {
        method: 'POST',
        headers,
        body: JSON.stringify(subscription),
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Push subscription failed');
    return await res.json();
}

// Push Notifications — Unsubscribe
export async function unsubscribePushNotification(endpoint) {
    const headers = await getAuthHeaders({ 'Content-Type': 'application/json' });
    await fetch(getApiUrl('/api/notifications/unsubscribe'), {
        method: 'POST',
        headers,
        body: JSON.stringify({ endpoint }),
        credentials: 'include'
    });
}

export async function fetchVapidPublicKey() {
    try {
        const res = await fetch(getApiUrl('/api/notifications/vapid-key'));
        if (res.ok) {
            const data = await res.json();
            return data.vapidPublicKey;
        }
    } catch (err) {}
    return vapidPublicKey;
}
