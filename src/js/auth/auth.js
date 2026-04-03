import { state, saveData } from '../core/state.js';
import { showToast } from '../ui/ui.js';
import { calculateGpa } from '../features/academics.js';
import { calculateOverallAttendance } from '../features/attendance.js';
import { ALL_ACHIEVEMENTS } from '../features/gamification.js';
import { auth, db, googleProvider } from '../core/firebase.js';
import { signOut, signInWithPopup, signInWithRedirect, getRedirectResult } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// ── Listen for Redirects (Non-blocking) ──
// Call this on app load so Firebase processes returning users from mobile redirect
export function setupAuthListener() {
    getRedirectResult(auth)
        .then(async (result) => {
            if (result && result.user) {
                console.log('[Auth] Redirect sign-in success!');
                await setupNewUser(result.user);
                showToast("Signed in successfully!", "success");
            }
        })
        .catch((error) => {
            console.warn('[Auth] Redirect sign-in error:', error);
            // Don't show toast on load unless necessary, just log it.
        });
}

// ── Google Sign-In ──────────────────────────
export const signInWithGoogle = () => {
    const btn = document.getElementById('google-signin-btn');
    const originalText = btn.innerHTML;
    
    // 1. Show immediate visual feedback
    btn.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Connecting...`;
    btn.disabled = true;

    // 2. Execute Auth Strategy (Popup ONLY - universally supported when called synchronously)
    signInWithPopup(auth, googleProvider)
        .then(async (result) => {
            await setupNewUser(result.user);
            showToast("Signed in with Google!", "success");
            btn.innerHTML = originalText;
            btn.disabled = false;
        })
        .catch((error) => {
            if (error.code === 'auth/popup-closed-by-user') {
                showToast("Sign-in cancelled.", "warning");
            } else if (error.code !== 'auth/cancelled-popup-request') {
                console.error('[Auth] Sign-in error:', error);
                // Last ditch fallback if popup is violently blocked by browser policies
                if (error.code === 'auth/popup-blocked' || error.code === 'auth/operation-not-supported-in-this-environment') {
                    showToast("Redirecting to login...", "warning");
                    signInWithRedirect(auth, googleProvider);
                    return;
                }
                showToast("Sign-in failed. Please try again.", "error");
            }
            btn.innerHTML = originalText;
            btn.disabled = false;
        });
};

// ── Logout ──────────────────────────────────
export const logoutUser = async () => {
    try {
        await signOut(auth);
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('attendoraState');
        window.location.reload();
    } catch (error) {
        showToast("Error logging out: " + error.message, "error");
    }
};

// ── Edit Profile Modal ──────────────────────
export function openEditProfileModal() {
    if (!auth.currentUser) return showToast("You must be signed in.", "error");

    document.getElementById('auth-page').classList.remove('hidden');
    document.getElementById('dashboard-app').classList.add('hidden');
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('edit-profile-form').classList.remove('hidden');

    // Populate fields
    document.getElementById('edit-name').value = state.userProfile.name || '';
    document.getElementById('edit-course').value = state.userProfile.course || '';
    document.getElementById('edit-year').value = state.userProfile.year || '';

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

    // Cancel handler
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

// ── Render Profile View ─────────────────────
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
    document.getElementById('profile-img').src = `https://placehold.co/128x128/${getComputedStyle(document.documentElement).getPropertyValue('--primary-color-start').substring(1)}/FFFFFF?text=${firstLetter}`;
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