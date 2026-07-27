let googleClientId = '';
let vapidPublicKey = '';

export function getApiUrl(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    const isStandaloneFile = window.location.protocol === 'file:';
    const baseUrl = isStandaloneFile ? 'https://attendora-sat.vercel.app' : '';
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    return baseUrl + cleanPath;
}

export async function loadApiConfig() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const response = await fetch(getApiUrl('/api/config'), { signal: controller.signal });
        clearTimeout(timeoutId);
        if (response.ok) {
            const config = await response.json();
            if (config.googleClientId) googleClientId = config.googleClientId;
            if (config.vapidPublicKey) vapidPublicKey = config.vapidPublicKey;
        }
    } catch (err) {
        console.error('[API Client] Failed to fetch config:', err);
    }
    return { googleClientId, vapidPublicKey };
}

export function getGoogleClientId() {
    return googleClientId;
}

// Google Login
export async function loginWithGoogleToken(credential) {
    const res = await fetch(getApiUrl('/api/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
        credentials: 'include'
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        let errMessage = `HTTP ${res.status}`;
        try {
            const json = JSON.parse(text);
            if (json.error) errMessage = json.error;
        } catch (e) {
            if (text) errMessage += `: ${text.substring(0, 100)}`;
        }
        throw new Error(errMessage);
    }

    return await res.json();
}

// Get Current Logged In User
export async function getCurrentUser() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(getApiUrl('/api/auth/me'), {
            credentials: 'include',
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!res.ok) return null;
        const data = await res.json();
        return data.user;
    } catch (err) {
        return null;
    }
}

// Logout
export async function logoutUserApi() {
    await fetch(getApiUrl('/api/auth/logout'), { method: 'POST', credentials: 'include' });
}

// Fetch Data from Cloud
export async function fetchUserData() {
    const res = await fetch(getApiUrl('/api/data'), { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch user data');
    const json = await res.json();
    return json.data;
}

// Save/Sync Data to Cloud
export async function saveUserData(dataPayload) {
    const res = await fetch(getApiUrl('/api/data'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
    const res = await fetch(getApiUrl('/api/notifications/subscribe'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Push subscription failed');
    return await res.json();
}

// Push Notifications — Unsubscribe
export async function unsubscribePushNotification(endpoint) {
    await fetch(getApiUrl('/api/notifications/unsubscribe'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

loadApiConfig();
