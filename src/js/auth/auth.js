import { state, saveData } from '../core/state.js';
import { showToast, toggleModal } from '../ui/ui.js';
import { calculateGpa } from '../features/academics.js';
import { calculateOverallAttendance } from '../features/attendance.js';
import { ALL_ACHIEVEMENTS } from '../features/gamification.js';
import { auth, db } from '../core/firebase.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { 
    doc, 
    setDoc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

export let forgotPasswordContact = null;

export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        showToast("Logged in successfully!", "success");
        setTimeout(() => window.location.reload(), 1500);
        return userCredential.user;
    } catch (error) {
        showToast(error.message, "error");
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        localStorage.removeItem('loggedIn');
        window.location.reload();
    } catch (error) {
        showToast("Error logging out: " + error.message, "error");
    }
};

export const handleSignup = async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-contact').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-password-confirm').value;
    const course = document.getElementById('signup-course').value;
    const year = document.getElementById('signup-year').value;

    if (password !== confirmPassword) {
        showToast("Passwords do not match.", "error");
        return;
    }

    if (!email.includes('@')) {
        showToast("Please use a valid email address for Firebase Auth.", "error");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save additional user info to Firestore
        await setDoc(doc(db, "users", user.uid), {
            name,
            email,
            course,
            year,
            createdAt: new Date().toISOString()
        });

        state.userProfile = { name, contact: email, course, year };
        saveData();
        
        showToast("Account created successfully!", "success");
        setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
        showToast(error.message, "error");
    }
};

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
            showToast("Please provide your Email address.", "error");
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
        
        // Use custom event or global to trigger UI update instead of direct main.js import
        window.dispatchEvent(new CustomEvent('attendora-update-ui'));
        
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