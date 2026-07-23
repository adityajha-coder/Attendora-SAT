let googleClientId = '';
let vapidPublicKey = '';

export async function loadApiConfig() {
    try {
        const response = await fetch('/api/config');
        if (response.ok) {
            const config = await response.json();
            googleClientId = config.googleClientId;
            vapidPublicKey = config.vapidPublicKey;
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
    const res = await fetch('/api/auth/google', {
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
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) return null;
        const data = await res.json();
        return data.user;
    } catch (err) {
        return null;
    }
}

// Logout
export async function logoutUserApi() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
}

// Fetch Data from PostgreSQL
export async function fetchUserData() {
    const res = await fetch('/api/data', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch user data');
    const json = await res.json();
    return json.data;
}

// Save/Sync Data to PostgreSQL
export async function saveUserData(dataPayload) {
    const res = await fetch('/api/data', {
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

loadApiConfig();
