// Handles user authentication, profile editing, and session management.
import { state, saveData, resetStateToDefaults } from '../core/state.js';
import { showToast } from '../ui/ui.js';
import { calculateOverallAttendance } from '../features/attendance.js';
import { loginWithGoogleToken, getCurrentUser, logoutUserApi, getGoogleClientId, loadApiConfig, getApiUrl } from '../core/api-client.js';
import { loadFromCloud, mergeCloudData, forceCloudSave } from '../services/cloud-sync.js';
import { showDashboard } from '../main.js';

export function setupAuthListener() {
    getCurrentUser().then(user => {
        if (user) {
            state.userProfile.name = user.name || state.userProfile.name;
            state.userProfile.contact = user.email || state.userProfile.contact;
            state.userProfile.course = user.course || state.userProfile.course;
            state.userProfile.year = user.year || state.userProfile.year;
            saveData();
            showDashboard();
        }
    }).catch(err => {
        console.log('[Auth] No active session:', err.message);
    });
}

function loadGoogleGsiSdk() {
    return new Promise((resolve) => {
        if (window.google?.accounts?.id) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.head.appendChild(script);
    });
}

let isGsiInitialized = false;

async function handleGoogleAuthResponse(response) {
    try {
        const result = await loginWithGoogleToken(response.credential);
        showToast(`Welcome back, ${result.user.name || 'User'}!`, "success");
        state.userProfile.name = result.user.name || state.userProfile.name;
        state.userProfile.contact = result.user.email || state.userProfile.contact;
        
        try {
            const cloudData = await loadFromCloud();
            if (cloudData) {
                mergeCloudData(state, cloudData);
            }
            await forceCloudSave(state);
        } catch (syncErr) {
            console.warn('[Sync] Cloud restore error on login:', syncErr);
        }

        saveData();
        showDashboard();
    } catch (loginErr) {
        showToast("Google Login Error: " + loginErr.message, "error");
    }
}

export async function initGoogleAuth() {
    const container = document.getElementById('google-signin-container');
    if (!container) return;

    try {
        let googleClientId = getGoogleClientId();
        if (!googleClientId) {
            const config = await loadApiConfig();
            googleClientId = config.googleClientId;
        }

        if (!googleClientId) {
            console.warn('[Auth] Google Client ID not available.');
            return;
        }

        const sdkLoaded = await loadGoogleGsiSdk();
        if (sdkLoaded && window.google?.accounts?.id) {
            window.google.accounts.id.initialize({
                client_id: googleClientId,
                auto_select: false,
                callback: handleGoogleAuthResponse
            });

            container.innerHTML = '';
            window.google.accounts.id.renderButton(container, {
                type: 'standard',
                theme: 'filled_blue',
                size: 'large',
                text: 'signin_with',
                shape: 'rectangular',
                width: Math.min(320, window.innerWidth - 48)
            });

            isGsiInitialized = true;

            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed()) {
                    console.log('[Auth] One-Tap prompt reason:', notification.getNotDisplayedReason?.());
                }
            });
        }
    } catch (err) {
        console.error('[Auth] initGoogleAuth exception:', err);
    }
}

// Google Sign-In
export const signInWithGoogle = async () => {
    if (!isGsiInitialized) {
        await initGoogleAuth();
    }
};

export const logoutUser = async () => {
    try {
        const currentUser = state.userProfile?.contact;
        if (currentUser) {
            const currentState = localStorage.getItem('attendoraState');
            if (currentState) {
                localStorage.setItem(`attendoraState_backup_${currentUser}`, currentState);
            }
        }
        await logoutUserApi();
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('attendoraState');
        resetStateToDefaults();
        window.location.reload();
    } catch (error) {
        showToast("Error logging out: " + error.message, "error");
    }
};

export async function openEditProfileModal() {
    const user = await getCurrentUser();
    if (!user) return showToast("You must be signed in.", "error");

    document.getElementById('auth-page').classList.remove('hidden');
    document.getElementById('dashboard-app').classList.add('hidden');
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('edit-profile-form').classList.remove('hidden');

    document.getElementById('edit-name').value = state.userProfile.name || user.name || '';
    document.getElementById('edit-course').value = state.userProfile.course || user.course || '';
    document.getElementById('edit-year').value = state.userProfile.year || user.year || '';

    // Save handler
    document.getElementById('edit-profile-form').onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('edit-name').value.trim();
        if (!name) return showToast("Name cannot be empty.", "error");

        state.userProfile.name = name;
        state.userProfile.course = document.getElementById('edit-course').value.trim();
        state.userProfile.year = document.getElementById('edit-year').value.trim();
        saveData();

        closeEditProfile();
        window.dispatchEvent(new CustomEvent('attendora-update-ui'));
        showToast("Profile updated!", "success");
    };

    document.getElementById('cancel-edit-profile-btn').onclick = () => {
        closeEditProfile();
        window.dispatchEvent(new CustomEvent('attendora-update-ui'));
    };
}

function closeEditProfile() {
    document.getElementById('edit-profile-form').classList.add('hidden');
    document.getElementById('auth-page').classList.add('hidden');
    document.getElementById('dashboard-app').classList.remove('hidden');
}

export function renderProfile() {
    state._cacheVersion = (state._cacheVersion || 0) + 1;
    const profile = state.userProfile || {};
    const contact = profile.contact || '';
    const stats = calculateOverallAttendance();
    const pct = stats.percentage;

    let tier = 'Low Performer', cls = 'bg-red-500/20 text-red-400';
    if (pct >= 90) { tier = 'High Performer'; cls = 'bg-green-500/20 text-green-400'; }
    else if (pct >= 75) { tier = 'On Track'; cls = 'bg-yellow-500/20 text-yellow-400'; }

    const displayName = profile.name || (contact ? contact.split('@')[0] : 'Student');
    const el = (id) => document.getElementById(id);
    if (el('profile-name-display')) el('profile-name-display').textContent = displayName;
    if (el('profile-email')) el('profile-email').textContent = contact || 'Not logged in';
    if (el('profile-mobile')) el('profile-mobile').textContent = contact || 'Not set';
    if (el('profile-img')) el('profile-img').src = `assets/images/fevicon.png`;
    if (el('profile-status-tier')) {
        el('profile-status-tier').textContent = `Attendance Tier: ${tier}`;
        el('profile-status-tier').className = `text-sm px-3 py-1 mt-1 rounded-full font-semibold ${cls}`;
    }
    if (el('profile-year')) el('profile-year').textContent = profile.year || 'Not set';
    if (el('profile-course')) el('profile-course').textContent = profile.course || 'Not set';
    if (el('profile-overall-attendance')) el('profile-overall-attendance').textContent = `${pct}%`;

    if (el('profile-total-classes')) el('profile-total-classes').textContent = stats.total;
    if (el('profile-total-present')) el('profile-total-present').textContent = stats.present;
    if (el('profile-total-absent')) el('profile-total-absent').textContent = stats.absent;

    if (el('profile-attendance-bar')) el('profile-attendance-bar').style.width = `${pct}%`;
    if (el('welcome-message')) el('welcome-message').textContent = `Welcome, ${displayName.split(' ')[0]}!`;
}