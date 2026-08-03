// Handles user authentication, profile editing, and session management.
import { state, saveData, resetStateToDefaults } from '../core/state.js';
import { showToast } from '../ui/ui.js';
import { calculateOverallAttendance } from '../features/attendance.js';
import { getClerkPublishableKey, getCurrentUser, logoutUserApi, loadApiConfig, clearAuthCache } from '../core/api-client.js';
import { loadFromCloud, mergeCloudData, forceCloudSave } from '../services/cloud-sync.js';
import { showDashboard } from '../main.js';

let isClerkSdkLoaded = false;
let clerkLoadPromise = null;
let isHandlingLogin = false;

function loadClerkSdk(publishableKey) {
    return new Promise((resolve) => {
        if (window.Clerk) return resolve(true);
        const script = document.createElement('script');
        script.setAttribute('data-clerk-publishable-key', publishableKey);
        script.src = 'https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5/dist/clerk.browser.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.head.appendChild(script);
    });
}

export async function initClerkAuth() {
    const config = await loadApiConfig();
    const pubKey = config.clerkPublishableKey || getClerkPublishableKey();

    if (!pubKey) {
        console.warn('[Clerk] No Clerk publishable key found.');
        return null;
    }

    if (!isClerkSdkLoaded) {
        if (!clerkLoadPromise) {
            clerkLoadPromise = (async () => {
                const loaded = await loadClerkSdk(pubKey);
                if (!loaded || !window.Clerk) {
                    throw new Error('Failed to load Clerk SDK script');
                }
                await window.Clerk.load();
                isClerkSdkLoaded = true;

                window.Clerk.addListener(({ user }) => {
                    if (user) {
                        handleClerkUserLoggedIn(user);
                    }
                });
                return window.Clerk;
            })();
        }
        try {
            await clerkLoadPromise;
        } catch (err) {
            console.error('[Clerk] SDK load error:', err);
            clerkLoadPromise = null;
            return null;
        }
    }

    return window.Clerk;
}

export async function renderClerkSignIn() {
    const clerk = await initClerkAuth();
    if (!clerk) return;

    if (clerk.user) {
        handleClerkUserLoggedIn(clerk.user);
        return;
    }

    const container = document.getElementById('clerk-auth-container');
    if (!container) return;

    container.innerHTML = '';
    try {
        clerk.mountSignIn(container);
    } catch (err) {
        console.error('[Clerk] Error mounting sign in component:', err);
    }
}

async function handleClerkUserLoggedIn(clerkUser) {
    // Guard against re-entrant calls
    if (isHandlingLogin) return;
    isHandlingLogin = true;

    try {
        const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress || '';
        const fullName = clerkUser.fullName || clerkUser.firstName || primaryEmail.split('@')[0] || 'User';

        state.userProfile.name = fullName;
        if (primaryEmail) state.userProfile.contact = primaryEmail;

        saveData();
        showDashboard();
        (async () => {
            try {
                clearAuthCache();
                const [user, cloudData] = await Promise.all([
                    getCurrentUser(),
                    loadFromCloud()
                ]);

                if (user) {
                    state.userProfile.name = user.name || state.userProfile.name;
                    state.userProfile.contact = user.email || state.userProfile.contact;
                    if (user.course) state.userProfile.course = user.course;
                    if (user.year) state.userProfile.year = user.year;
                }

                if (cloudData) {
                    mergeCloudData(state, cloudData);
                }

                saveData();
                window.dispatchEvent(new CustomEvent('attendora-update-ui'));
                forceCloudSave(state).catch(() => {});
            } catch (syncErr) {
                console.warn('[Sync] Background sync error after login:', syncErr);
            }
        })();
    } catch (err) {
        console.error('[Clerk] Error handling logged in user:', err);
    } finally {
        isHandlingLogin = false;
    }
}

export const logoutUser = async () => {
    try {
        const currentUser = state.userProfile?.contact;
        if (currentUser) {
            const currentState = localStorage.getItem('attendoraState');
            if (currentState) {
                localStorage.setItem(`attendoraState_backup_${currentUser}`, currentState);
            }
        }
        await forceCloudSave(state).catch(() => {});
        if (window.Clerk) {
            await window.Clerk.signOut().catch(() => {});
        }
        clearAuthCache();
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
    const wrapper = document.getElementById('edit-profile-wrapper');
    if (wrapper) wrapper.classList.remove('hidden');

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
    const wrapper = document.getElementById('edit-profile-wrapper');
    if (wrapper) wrapper.classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
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