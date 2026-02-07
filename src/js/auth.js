import { state, saveData } from './state.js';
import { showToast, toggleModal } from './ui.js';
import { updateAllViews, showDashboard } from './main.js';
import { calculateGpa } from './academics.js';
import { calculateOverallAttendance } from './attendance.js';
import { ALL_ACHIEVEMENTS } from './gamification.js';

export let forgotPasswordContact = null;

export const loginUser = (contact) => {
    localStorage.setItem('loggedIn', 'true');
    showDashboard();
};

export const handleSignup = (e) => {
    e.preventDefault();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-password-confirm').value;
    const contact = document.getElementById('signup-contact').value;

    if (password !== confirmPassword) {
        showToast("Passwords do not match.", "error");
        return;
    }

    if (!contact) {
        showToast("Please provide your Mobile Number or Email address.", "error");
        return;
    }
    
    state.userProfile = {
        name: document.getElementById('signup-name').value,
        contact: contact,
        course: document.getElementById('signup-course').value,
        year: document.getElementById('signup-year').value,
    };
    
    openOtpModal(contact);
};

export function openOtpModal(contact) {
    document.getElementById('auth-page').classList.add('hidden');
    const contactMethod = contact.includes('@') ? 'email' : 'mobile number';
    document.getElementById('otp-instruction').textContent = `A 6-digit code has been sent to your ${contactMethod}. Enter it below (Hint: 123456).`;
    toggleModal(document.getElementById('otp-modal'), true);
}

export function openResetPasswordModal(contact) {
    const contactMethod = contact.includes('@') ? 'email' : 'mobile number';
    document.getElementById('reset-code-instruction').textContent = `A 6-digit code has been sent to your ${contactMethod}. Enter it and set a new password (Hint: 123456).`;
    toggleModal(document.getElementById('reset-password-modal'), true);
}

export function openEditProfileModal() {
    document.getElementById('auth-page').classList.remove('hidden');
    document.getElementById('dashboard-app').classList.add('hidden');
    document.getElementById('signup-form').classList.remove('hidden');
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-name').value = state.userProfile.name || '';
    document.getElementById('signup-contact').value = state.userProfile.contact || '';
    document.getElementById('signup-course').value = state.userProfile.course || '';
    document.getElementById('signup-year').value = state.userProfile.year || '';
    const passwordInput = document.getElementById('signup-password');
    const confirmPasswordInput = document.getElementById('signup-password-confirm');
    passwordInput.value = '';
    confirmPasswordInput.value = '';
    passwordInput.removeAttribute('required');
    confirmPasswordInput.removeAttribute('required');
    document.querySelector('#signup-form .mb-4:has(#signup-password)').classList.add('hidden');
    document.querySelector('#signup-form .mb-6:has(#signup-password-confirm)').classList.add('hidden');
    document.querySelector('#signup-form h2').textContent = 'Update Profile Details';
    document.querySelector('#signup-form p').textContent = 'Modify your personal and institutional information.';
    document.getElementById('show-login').parentElement.classList.add('hidden');
    const signupButton = document.querySelector('#signup-form button[type="submit"]');
    signupButton.textContent = 'Save Changes';
    document.getElementById('signup-form').onsubmit = (e) => {
        e.preventDefault();
        const contact = document.getElementById('signup-contact').value;
        const name = document.getElementById('signup-name').value;
        if (!contact) {
            showToast("Please provide your Mobile Number or Email address.", "error");
            return;
        }
        if (!name) {
            showToast("Please provide your Full Name.", "error");
            return;
        }
        state.userProfile.name = name;
        state.userProfile.contact = contact;
        state.userProfile.course = document.getElementById('signup-course').value;
        state.userProfile.year = document.getElementById('signup-year').value;
        saveData();
        document.getElementById('show-login').parentElement.classList.remove('hidden');
        document.querySelector('#signup-form h2').textContent = 'Create Account';
        document.querySelector('#signup-form p').textContent = 'Start your journey with Attendora.';
        signupButton.textContent = 'Sign Up';
        document.getElementById('signup-form').onsubmit = handleSignup; 
        passwordInput.setAttribute('required', '');
        confirmPasswordInput.setAttribute('required', '');
        document.querySelector('#signup-form .mb-4:has(#signup-password)').classList.remove('hidden');
        document.querySelector('#signup-form .mb-6:has(#signup-password-confirm)').classList.remove('hidden');
        showDashboard();
        updateAllViews();
        showToast("Profile details updated!", "success");
    };
}

export function renderProfile() {
    const profile = state.userProfile || {};
    const contact = profile.contact || 'user@example.com';
    const firstLetter = (profile.name || contact).charAt(0).toUpperCase() || 'A';
    const { totalCredits, gpa } = calculateGpa();
    const totalAttendanceStats = calculateOverallAttendance();
    const attendancePercentage = totalAttendanceStats.percentage;
    let statusTier = 'Low Performer';
    let statusClass = 'bg-red-500/20 text-red-400';
    if (attendancePercentage >= 90) {
        statusTier = 'High Performer';
        statusClass = 'bg-green-500/20 text-green-400';
    } else if (attendancePercentage >= 75) {
        statusTier = 'On Track';
        statusClass = 'bg-yellow-500/20 text-yellow-400';
    }

    const unlockedAchievements = Object.values(ALL_ACHIEVEMENTS).filter(a => state.achievements[a.id]?.unlocked).length;
    const totalAchievements = Object.keys(ALL_ACHIEVEMENTS).length;

    document.getElementById('profile-name-display').textContent = profile.name || (contact.split('@')[0]);
    document.getElementById('profile-email').textContent = contact; 
    document.getElementById('profile-mobile').textContent = contact; 
    document.getElementById('profile-img').src = `https://placehold.co/128x128/${getComputedStyle(document.documentElement).getPropertyValue('--primary-color-start').substring(1)}/FFFFFF?text=${firstLetter}`;
    document.getElementById('profile-status-tier').textContent = `Attendance Tier: ${statusTier}`;
    document.getElementById('profile-status-tier').className = `text-sm px-3 py-1 mt-1 rounded-full font-semibold ${statusClass}`;
    document.getElementById('profile-total-credits').textContent = totalCredits;
    document.getElementById('profile-year').textContent = profile.year || 'Not set';
    document.getElementById('profile-course').textContent = profile.course || 'Not set';
    document.getElementById('profile-overall-attendance').textContent = `${attendancePercentage}%`;
    document.getElementById('profile-calculated-gpa').textContent = gpa.toFixed(2);
    document.getElementById('profile-attendance-bar').style.width = `${attendancePercentage}%`;
    document.getElementById('profile-achievements-unlocked').textContent = `${unlockedAchievements} / ${totalAchievements}`;
    document.getElementById('welcome-message').textContent = `Welcome, ${profile.name.split(' ')[0] || contact.split('@')[0]}!`;
}