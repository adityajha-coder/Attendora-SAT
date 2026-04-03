import { state, saveData } from '../core/state.js';
import { showToast, toggleModal } from '../ui/ui.js';
import { calculateGpa } from '../features/academics.js';
import { calculateOverallAttendance } from '../features/attendance.js';
import { ALL_ACHIEVEMENTS } from '../features/gamification.js';
import { auth, db, googleProvider } from '../core/firebase.js';
import { forceCloudSave } from '../services/cloud-sync.js';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithPopup,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    linkWithCredential
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
        // onAuthStateChanged in main.js handles the rest
        return userCredential.user;
    } catch (error) {
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
            showToast("Account not found or invalid password! Please 'Sign Up' first if you don't have an account.", "error");
        } else {
            showToast(error.message, "error");
        }
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('attendoraState'); // Clear local data to prevent leak
        window.location.reload();
    } catch (error) {
        showToast("Error logging out: " + error.message, "error");
    }
};

export const handleSignup = async (e) => {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerText : 'Sign Up';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-contact').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-password-confirm').value;
    const course = document.getElementById('signup-course').value;
    const year = document.getElementById('signup-year').value;

    if (password !== confirmPassword) {
        showToast("Passwords do not match.", "error");
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerText = originalText; }
        return;
    }

    if (!email.includes('@')) {
        showToast("Please use a valid email address for Firebase Auth.", "error");
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerText = originalText; }
        return;
    }

    try {
        // Clear local storage before creating new account to prevent data leaks
        localStorage.removeItem('attendoraState');
        localStorage.removeItem('loggedIn');

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

        // Set local profile state
        state.userProfile.name = name;
        state.userProfile.contact = email;
        state.userProfile.course = course;
        state.userProfile.year = year;
        saveData();

        showToast("Account created successfully!", "success");
        // onAuthStateChanged in main.js handles the rest (shows dashboard)
    } catch (error) {
        showToast(error.message, "error");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = originalText;
        }
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
    document.getElementById('signup-password-wrapper').classList.add('hidden');
    document.getElementById('signup-password-confirm-wrapper').classList.add('hidden');
    document.querySelector('#signup-form h2').textContent = 'Update Profile Details';
    document.querySelector('#signup-form p').textContent = 'Modify your personal and institutional information.';
    document.getElementById('show-login').parentElement.classList.add('hidden');
    const signupButton = document.querySelector('#signup-form button[type="submit"]');
    signupButton.textContent = 'Save Changes';

    // Hide Google sign-up button and divider in edit mode
    document.getElementById('signup-google-divider').classList.add('hidden');
    document.getElementById('google-signup-btn').classList.add('hidden');

    // Detect auth provider: does the user have a password-based login?
    const user = auth.currentUser;
    const hasPasswordProvider = user?.providerData?.some(p => p.providerId === 'password');
    const passwordMgmtSection = document.getElementById('password-management-section');
    const changePwSection = document.getElementById('change-password-section');
    const createPwSection = document.getElementById('create-password-section');

    // Show the password management area
    passwordMgmtSection.classList.remove('hidden');

    if (hasPasswordProvider) {
        // User has a password — show Change Password
        changePwSection.classList.remove('hidden');
        createPwSection.classList.add('hidden');
    } else {
        // Google-only user — show Create Password
        changePwSection.classList.add('hidden');
        createPwSection.classList.remove('hidden');
    }

    // Clear password fields
    const currentPwInput = document.getElementById('current-password');
    const newPwInput = document.getElementById('new-password');
    const newPwConfirmInput = document.getElementById('new-password-confirm');
    const createPwInput = document.getElementById('create-password');
    const createPwConfirmInput = document.getElementById('create-password-confirm');
    if (currentPwInput) currentPwInput.value = '';
    if (newPwInput) newPwInput.value = '';
    if (newPwConfirmInput) newPwConfirmInput.value = '';
    if (createPwInput) createPwInput.value = '';
    if (createPwConfirmInput) createPwConfirmInput.value = '';

    // Wire up Change Password handler
    const changePwBtn = document.getElementById('change-password-btn');
    changePwBtn.onclick = async () => {
        const currentPw = currentPwInput.value;
        const newPw = newPwInput.value;
        const newPwConfirm = newPwConfirmInput.value;

        if (!currentPw) { showToast('Please enter your current password.', 'error'); return; }
        if (!newPw || newPw.length < 6) { showToast('New password must be at least 6 characters.', 'error'); return; }
        if (newPw !== newPwConfirm) { showToast('New passwords do not match.', 'error'); return; }

        changePwBtn.disabled = true;
        changePwBtn.textContent = 'Changing...';
        try {
            const credential = EmailAuthProvider.credential(user.email, currentPw);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPw);
            showToast('Password changed successfully!', 'success');
            currentPwInput.value = '';
            newPwInput.value = '';
            newPwConfirmInput.value = '';
        } catch (error) {
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                showToast('Current password is incorrect.', 'error');
            } else {
                showToast('Failed to change password: ' + error.message, 'error');
            }
        } finally {
            changePwBtn.disabled = false;
            changePwBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg> Change Password';
        }
    };

    // Wire up Create Password handler (for Google-only users)
    const createPwBtn = document.getElementById('create-password-btn');
    createPwBtn.onclick = async () => {
        const newPw = createPwInput.value;
        const newPwConfirm = createPwConfirmInput.value;

        if (!newPw || newPw.length < 6) { showToast('Password must be at least 6 characters.', 'error'); return; }
        if (newPw !== newPwConfirm) { showToast('Passwords do not match.', 'error'); return; }

        createPwBtn.disabled = true;
        createPwBtn.textContent = 'Creating...';
        try {
            const credential = EmailAuthProvider.credential(user.email, newPw);
            await linkWithCredential(user, credential);
            showToast('Password created! You can now sign in with email & password too.', 'success');
            createPwInput.value = '';
            createPwConfirmInput.value = '';
            // Switch to showing Change Password since they now have a password
            createPwSection.classList.add('hidden');
            changePwSection.classList.remove('hidden');
        } catch (error) {
            if (error.code === 'auth/provider-already-linked') {
                showToast('You already have a password set up.', 'warning');
                createPwSection.classList.add('hidden');
                changePwSection.classList.remove('hidden');
            } else {
                showToast('Failed to create password: ' + error.message, 'error');
            }
        } finally {
            createPwBtn.disabled = false;
            createPwBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> Create Password';
        }
    };

    // Add Cancel button logic
    let cancelBtn = document.getElementById('cancel-edit-profile-btn');
    if (!cancelBtn) {
        cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancel-edit-profile-btn';
        cancelBtn.type = 'button';
        cancelBtn.className = 'w-full bg-white/10 text-white font-bold py-3 px-6 rounded-lg mt-4 border border-white/20 hover:bg-white/20 transition-colors';
        cancelBtn.textContent = 'Cancel Edit';
        signupButton.parentNode.insertBefore(cancelBtn, signupButton.nextSibling);
    }
    cancelBtn.classList.remove('hidden');

    const finishEdit = () => {
        document.getElementById('show-login').parentElement.classList.remove('hidden');
        document.querySelector('#signup-form h2').textContent = 'Create Account';
        document.querySelector('#signup-form p').textContent = 'Start your journey with Attendora.';
        signupButton.textContent = 'Sign Up';
        document.getElementById('signup-form').onsubmit = handleSignup;
        passwordInput.setAttribute('required', '');
        confirmPasswordInput.setAttribute('required', '');
        document.getElementById('signup-password-wrapper').classList.remove('hidden');
        document.getElementById('signup-password-confirm-wrapper').classList.remove('hidden');
        if (cancelBtn) cancelBtn.classList.add('hidden');

        // Restore Google buttons and divider
        document.getElementById('signup-google-divider').classList.remove('hidden');
        document.getElementById('google-signup-btn').classList.remove('hidden');

        // Hide password management section
        passwordMgmtSection.classList.add('hidden');
        changePwSection.classList.add('hidden');
        createPwSection.classList.add('hidden');

        // Restore dashboard view!
        document.getElementById('auth-page').classList.add('hidden');
        document.getElementById('dashboard-app').classList.remove('hidden');
    };

    cancelBtn.onclick = () => {
        finishEdit();
        window.dispatchEvent(new CustomEvent('attendora-update-ui'));
    };

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
        
        finishEdit();
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
    
    // Fill in detailed attendance numbers
    const totalClassesEl = document.getElementById('profile-total-classes');
    if (totalClassesEl) totalClassesEl.textContent = totalAttendanceStats.total;
    const presentEl = document.getElementById('profile-total-present');
    if (presentEl) presentEl.textContent = totalAttendanceStats.present;
    const absentEl = document.getElementById('profile-total-absent');
    if (absentEl) absentEl.textContent = totalAttendanceStats.absent;

    document.getElementById('profile-calculated-gpa').textContent = gpa.toFixed(2);
    document.getElementById('profile-attendance-bar').style.width = `${attendancePercentage}%`;
    document.getElementById('profile-achievements-unlocked').textContent = `${unlockedAchievements} / ${totalAchievements}`;
    document.getElementById('welcome-message').textContent = `Welcome, ${(profile.name || '').split(' ')[0] || contact.split('@')[0]}!`;
}

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if this is a new user — save profile to Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                name: user.displayName || '',
                email: user.email,
                course: '',
                year: '',
                createdAt: new Date().toISOString()
            });
        }

        // Set local profile
        state.userProfile.name = state.userProfile.name || user.displayName || user.email.split('@')[0];
        state.userProfile.contact = user.email;
        saveData();

        showToast("Signed in with Google!", "success");
        // onAuthStateChanged in main.js handles the rest
    } catch (error) {
        if (error.code === 'auth/popup-closed-by-user') {
            showToast("Google sign-in was cancelled.", "warning");
        } else if (error.code === 'auth/cancelled-popup-request') {
            // Ignore duplicate popup requests
        } else {
            showToast("Google sign-in failed: " + error.message, "error");
        }
    }
};