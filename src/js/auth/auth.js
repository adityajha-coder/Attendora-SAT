// Handles user authentication, profile editing, and session management.
import { state, saveData } from '../core/state.js';
import { showToast } from '../ui/ui.js';
import { calculateGpa } from '../features/academics.js';
import { calculateOverallAttendance } from '../features/attendance.js';
import { ALL_ACHIEVEMENTS } from '../features/gamification.js';
import { loginWithGoogleToken, getCurrentUser, logoutUserApi, getGoogleClientId, loadApiConfig } from '../core/api-client.js';
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

// Google Sign-In
export const signInWithGoogle = async () => {
    const btn = document.getElementById('google-signin-btn');
    const originalText = btn ? btn.innerHTML : '';

    if (btn) {
        btn.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Connecting...`;
        btn.disabled = true;
    }

    try {
        let googleClientId = getGoogleClientId();
        if (!googleClientId) {
            const config = await loadApiConfig();
            googleClientId = config.googleClientId;
        }
        const sdkLoaded = await loadGoogleGsiSdk();

        if (sdkLoaded && googleClientId && window.google?.accounts?.id) {
            window.google.accounts.id.initialize({
                client_id: googleClientId,
                callback: async (response) => {
                    try {
                        const result = await loginWithGoogleToken(response.credential);
                        showToast(`Welcome back, ${result.user.name || 'User'}!`, "success");
                        state.userProfile.name = result.user.name || state.userProfile.name;
                        state.userProfile.contact = result.user.email || state.userProfile.contact;
                        saveData();
                        showDashboard();
                    } catch (loginErr) {
                        showToast("Google Login Error: " + loginErr.message, "error");
                    } finally {
                        if (btn) {
                            btn.innerHTML = originalText;
                            btn.disabled = false;
                        }
                    }
                }
            });

            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    console.log('[Auth] Prompt dismissed or skipped, attempting popup...');
                }
            });
        } else {
            showToast("Google Client ID not configured in .env yet.", "info");
            if (btn) {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }
    } catch (err) {
        console.error('[Auth] Sign-in exception:', err);
        showToast("Sign-in failed: " + err.message, "error");
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
};

export const logoutUser = async () => {
    try {
        await logoutUserApi();
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('attendoraState');
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
    const profile = state.userProfile || {};
    const contact = profile.contact || 'user@example.com';
    const firstLetter = (profile.name || contact).charAt(0).toUpperCase() || 'A';
    const { totalCredits, gpa } = calculateGpa();
    const stats = calculateOverallAttendance();
    const pct = stats.percentage;

    let tier = 'Low Performer', cls = 'bg-red-500/20 text-red-400';
    if (pct >= 90) { tier = 'High Performer'; cls = 'bg-green-500/20 text-green-400'; }
    else if (pct >= 75) { tier = 'On Track'; cls = 'bg-yellow-500/20 text-yellow-400'; }

    const unlocked = Object.values(ALL_ACHIEVEMENTS).filter(a => state.achievements[a.id]?.unlocked).length;
    const total = Object.keys(ALL_ACHIEVEMENTS).length;

    document.getElementById('profile-name-display').textContent = profile.name || contact.split('@')[0];
    document.getElementById('profile-email').textContent = contact;
    document.getElementById('profile-mobile').textContent = contact;
    document.getElementById('profile-img').src = `assets/images/fevicon.png`; // profile logo
    document.getElementById('profile-status-tier').textContent = `Attendance Tier: ${tier}`;
    document.getElementById('profile-status-tier').className = `text-sm px-3 py-1 mt-1 rounded-full font-semibold ${cls}`;
    document.getElementById('profile-total-credits').textContent = totalCredits;
    document.getElementById('profile-year').textContent = profile.year || 'Not set';
    document.getElementById('profile-course').textContent = profile.course || 'Not set';
    document.getElementById('profile-overall-attendance').textContent = `${pct}%`;

    const el = (id) => document.getElementById(id);
    if (el('profile-total-classes')) el('profile-total-classes').textContent = stats.total;
    if (el('profile-total-present')) el('profile-total-present').textContent = stats.present;
    if (el('profile-total-absent')) el('profile-total-absent').textContent = stats.absent;

    document.getElementById('profile-calculated-gpa').textContent = gpa.toFixed(2);
    document.getElementById('profile-attendance-bar').style.width = `${pct}%`;
    document.getElementById('profile-achievements-unlocked').textContent = `${unlocked} / ${total}`;
    document.getElementById('welcome-message').textContent = `Welcome, ${(profile.name || '').split(' ')[0] || contact.split('@')[0]}!`;
}