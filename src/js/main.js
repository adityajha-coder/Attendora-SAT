import { authHtml } from './components/auth-html.js';
import { landingHtml } from './components/landing-html.js';
import { dashboardHtml } from './components/dashboard-html.js';
import { modalsHtml } from './components/modals-html.js';
import { updateOverviewStats, updateGoalOrientedCard, updateNextClassCountdown, renderArchivedTermsList, toggleArchivedTermsList, updateTermDatesUI, saveTermDates, archiveCurrentTerm, renderOverviewCards } from './services/app-helpers.js';
import { checkNotificationStatus, handleNotificationToggle } from './ui/notifications.js';
import { exportHistoryToCSV, exportData, importData } from './services/data.js';
import { startOnboardingTour } from './ui/tour.js';
import { openTimetableScanner, handleTimetableScan, handleSaveScannedSchedule } from './features/scanner.js';
import { handleSidebarNav, toggleMobileSidebar, closeMobileSidebar } from './ui/sidebar.js';
import { debounce } from './core/utils.js';
import { state, saveData, loadData, applyTheme, applyLightMode } from './core/state.js';
import { renderThemePicker, toggleModal, showToast, filterGrid, filterTable, renderCalendar } from './ui/ui.js';
import { loginUser, logoutUser, handleSignup, renderProfile, openEditProfileModal } from './auth/auth.js';
import { auth } from './core/firebase.js';
import { onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { loadFromCloud, mergeCloudData, forceCloudSave } from './services/cloud-sync.js';
import { renderSchedule, renderTodaysClasses, openClassModal, populateModalForEdit, handleDeleteClass, handleClassFormSubmit, updateDurationFeedback, handleDurationPreset } from './features/schedule.js';
import { handleAttendanceAction, openEditAttendanceModal, autoMarkMissedClasses, renderReports, renderCourses } from './features/attendance.js';
import { renderAssignments, handleAssignmentFormSubmit, handleDeleteAssignment, openAssignmentModal, renderGpaCalculator, handleGpaFormSubmit, handleDeleteGpaCourse, openGpaModal, openNoteModal, handleNoteSubmit, showCourseDetails } from './features/academics.js';
import { checkAchievements, renderAchievements, generateSemesterWrapped, shareSemesterWrapped } from './features/gamification.js';

export const showDashboard = () => {
    document.getElementById('auth-page').classList.add('hidden');
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('dashboard-app').classList.remove('hidden');
    dismissLoader();
    initializeDashboard();
};

const showLandingPage = () => {
    document.getElementById('dashboard-app').classList.add('hidden');
    document.getElementById('auth-page').classList.add('hidden');
    document.getElementById('landing-page').classList.remove('hidden');
    dismissLoader();
};

function dismissLoader() {
    const loader = document.getElementById('app-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
    }
}

const showAuthPage = (showLogin = true) => {
    document.getElementById('dashboard-app').classList.add('hidden');
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('auth-page').classList.remove('hidden');
    document.getElementById('login-form').classList.toggle('hidden', !showLogin);
    document.getElementById('signup-form').classList.toggle('hidden', showLogin);
    dismissLoader();
};

const initializeAttendora = () => {
    document.getElementById('app').innerHTML = authHtml + landingHtml + dashboardHtml + modalsHtml;

    loadData();
    setupEventListeners();

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Check if account is newly created and requires verification check before entering dashboard
            const creationTime = new Date(user.metadata.creationTime);
            const enforcementDate = new Date("2026-04-01T00:00:00Z");
            
            if (creationTime > enforcementDate && !user.emailVerified) {
                // If they somehow got stuck logged in without being verified, forcefully log them out
                auth.signOut();
                return;
            }

            // Show loading indicator while syncing from cloud
            const syncIndicator = document.getElementById('cloud-sync-indicator');
            if (syncIndicator) syncIndicator.style.display = 'flex';

            // Load cloud data and merge with local
            try {
                const cloudData = await loadFromCloud();
                if (cloudData) {
                    const wasMerged = mergeCloudData(state, cloudData);
                    if (wasMerged) {
                        // Cloud data was used — save merged result to localStorage
                        localStorage.setItem('attendoraState', JSON.stringify(state));
                        applyTheme(state.settings.selectedTheme);
                        applyLightMode(state.settings.isLightMode);
                    } else {
                        // Local data is newer — push to cloud
                        forceCloudSave(state);
                    }
                } else {
                    // No cloud data exists yet — push local to cloud
                    forceCloudSave(state);
                }
            } catch (err) {
                console.warn('[CloudSync] Sync on login failed, using local data:', err);
            }

            if (!state.userProfile.contact) {
                state.userProfile.contact = user.email;
                state.userProfile.name = state.userProfile.name || user.email.split('@')[0];
                saveData();
            }
            localStorage.setItem('loggedIn', 'true');
            showDashboard();
        } else {
            localStorage.removeItem('loggedIn');
            // If the user is actively looking at the auth page (like during signup), don't abruptly hide it
            if (document.getElementById('auth-page').classList.contains('hidden')) {
                showLandingPage();
            } else {
                dismissLoader();
            }
        }
    });
};

const initializeDashboard = () => {
    autoMarkMissedClasses();
    renderThemePicker();
    checkNotificationStatus();
    updateTermDatesUI();
    updateAllViews();

    if (!state.settings.hasCompletedTour) {
        setTimeout(startOnboardingTour, 1000);
    }
};

export const updateAllViews = () => {
    renderOverviewCards();
    renderSchedule();
    renderTodaysClasses();
    renderCourses();
    renderAssignments();
    renderCalendar();
    renderAchievements();
    renderReports();
    renderProfile();
    renderGpaCalculator();
    updateOverviewStats();
    updateGoalOrientedCard();
    updateNextClassCountdown();

    const addAssignmentBtn = document.getElementById('add-assignment-btn');
    const hasCourses = state.schedule.length > 0;
    if (addAssignmentBtn) {
        addAssignmentBtn.disabled = !hasCourses;
        addAssignmentBtn.classList.toggle('opacity-50', !hasCourses);
        addAssignmentBtn.classList.toggle('cursor-not-allowed', !hasCourses);
        addAssignmentBtn.title = hasCourses ? '' : 'Please add a course first before adding an assignment.';
    }
};

function setupEventListeners() {
    window.addEventListener('attendora-update-ui', () => {
        updateAllViews();
    });

    document.getElementById('show-signup').addEventListener('click', (e) => { e.preventDefault(); showAuthPage(false); });
    document.getElementById('show-login').addEventListener('click', (e) => { e.preventDefault(); showAuthPage(true); });
    document.getElementById('go-to-login-btn').addEventListener('click', (e) => { e.preventDefault(); showAuthPage(true); });
    document.getElementById('go-to-signup-btn').addEventListener('click', (e) => { e.preventDefault(); showAuthPage(false); });

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-contact').value;
        const password = document.getElementById('login-password').value;
        try {
            await loginUser(email, password);
            localStorage.setItem('loggedIn', 'true');
        } catch (err) {
            // Error toast in auth.js
        }
    });

    document.getElementById('signup-form').onsubmit = handleSignup;

    document.getElementById('mobile-menu-btn').addEventListener('click', toggleMobileSidebar);
    document.getElementById('sidebar-overlay').addEventListener('click', closeMobileSidebar);

    document.body.addEventListener('click', (e) => {
        if (e.target.closest('.close-modal-btn')) {
            toggleModal(e.target.closest('.modal-overlay'), false);
        }
    });

    document.getElementById('class-form').addEventListener('submit', handleClassFormSubmit);
    document.getElementById('assignment-form').addEventListener('submit', handleAssignmentFormSubmit);
    document.getElementById('notes-form').addEventListener('submit', handleNoteSubmit);
    document.getElementById('gpa-form').addEventListener('submit', handleGpaFormSubmit);

    document.getElementById('start-time').addEventListener('input', updateDurationFeedback);
    document.getElementById('end-time').addEventListener('input', updateDurationFeedback);
    document.getElementById('duration-preset').addEventListener('change', handleDurationPreset);

    document.getElementById('add-class-btn').addEventListener('click', () => openClassModal(null, 'Class'));
    document.getElementById('add-assignment-btn').addEventListener('click', () => openAssignmentModal());
    document.getElementById('add-gpa-course-btn').addEventListener('click', () => openGpaModal());

    document.getElementById('settings-btn').addEventListener('click', () => {
        updateTermDatesUI();
        renderArchivedTermsList();
        toggleModal(document.getElementById('settings-modal'), true);
    });

    document.getElementById('edit-profile-btn').addEventListener('click', openEditProfileModal);

    document.getElementById('export-csv-btn').addEventListener('click', exportHistoryToCSV);
    document.getElementById('export-data-btn').addEventListener('click', exportData);
    document.getElementById('import-data-input').addEventListener('change', importData);
    document.getElementById('semester-wrapped-btn').addEventListener('click', generateSemesterWrapped);
    document.getElementById('share-wrapped-btn').addEventListener('click', shareSemesterWrapped);
    document.getElementById('start-tour-btn').addEventListener('click', startOnboardingTour);

    document.getElementById('save-term-dates-btn').addEventListener('click', saveTermDates);
    document.getElementById('archive-term-btn-danger').addEventListener('click', archiveCurrentTerm);
    document.getElementById('reports-filter').addEventListener('change', renderReports);
    document.getElementById('view-archived-terms-btn').addEventListener('click', toggleArchivedTermsList);

    document.getElementById('schedule-view').addEventListener('click', (e) => {
        if (e.target.closest('#scan-timetable-btn') || e.target.closest('#scan-timetable-prompt-btn')) {
            openTimetableScanner();
        }
        if (e.target.closest('#add-class-prompt-btn')) {
            openClassModal();
        }
    });
    document.getElementById('timetable-file-input').addEventListener('change', handleTimetableScan);
    document.getElementById('save-scanned-schedule-btn').addEventListener('click', handleSaveScannedSchedule);

    document.getElementById('settings-modal').addEventListener('click', (e) => {
        const swatch = e.target.closest('#theme-picker button');
        if (swatch) {
            applyTheme(swatch.dataset.theme);
            renderThemePicker();
            saveData();
        }
    });

    document.getElementById('theme-toggle').addEventListener('change', (e) => {
        applyLightMode(e.target.checked);
        saveData();
    });

    document.getElementById('dashboard-app').addEventListener('click', e => {
        const courseCard = e.target.closest('#courses-grid .course-card-clickable');
        if (courseCard) {
            showCourseDetails(courseCard.dataset.courseName);
            return;
        }

        const editClassBtn = e.target.closest('.edit-class-btn');
        if (editClassBtn) {
            populateModalForEdit(parseFloat(editClassBtn.dataset.classId));
            return;
        }
        const deleteClassBtn = e.target.closest('.delete-class-btn');
        if (deleteClassBtn) {
            handleDeleteClass(parseFloat(deleteClassBtn.dataset.classId));
            return;
        }

        const attendanceBtn = e.target.closest('#upcoming-classes-list button[data-status]');
        if (attendanceBtn) {
            handleAttendanceAction(parseFloat(attendanceBtn.dataset.classId), attendanceBtn.dataset.status);
            return;
        }
        const editStatusBtn = e.target.closest('#upcoming-classes-list button.edit-status-btn');
        if (editStatusBtn) {
            const classId = parseFloat(editStatusBtn.dataset.classId);
            const historyId = parseFloat(editStatusBtn.dataset.historyId);
            const courseName = editStatusBtn.dataset.courseName;
            openEditAttendanceModal(classId, historyId, courseName);
            return;
        }

        const editAssignmentBtn = e.target.closest('.edit-assignment-btn');
        if (editAssignmentBtn) {
            openAssignmentModal(editAssignmentBtn.dataset.assignmentId);
            return;
        }
        const deleteAssignmentBtn = e.target.closest('.delete-assignment-btn');
        if (deleteAssignmentBtn) {
            handleDeleteAssignment(deleteAssignmentBtn.dataset.assignmentId);
            return;
        }

        const editGpaBtn = e.target.closest('.edit-gpa-btn');
        if (editGpaBtn) {
            openGpaModal(editGpaBtn.dataset.gpaId);
            return;
        }
        const deleteGpaBtn = e.target.closest('.delete-gpa-btn');
        if (deleteGpaBtn) {
            handleDeleteGpaCourse(deleteGpaBtn.dataset.gpaId);
            return;
        }

        const noteBtn = e.target.closest('.add-note-btn');
        if (noteBtn) {
            openNoteModal(parseInt(noteBtn.dataset.historyId));
            return;
        }
    });

    document.getElementById('edit-attendance-modal').addEventListener('click', (e) => {
        const actionBtn = e.target.closest('.edit-attendance-action-btn');
        if (actionBtn) {
            const newStatus = actionBtn.dataset.status;
            const reason = document.getElementById('absent-reason').value;
            const reasonToPass = (newStatus === 'Absent' || newStatus === 'Cancelled') ? reason : '';
            handleAttendanceAction(state.editingAttendance.classId, newStatus, state.editingAttendance.historyId, reasonToPass);
            toggleModal(document.getElementById('edit-attendance-modal'), false);
        }
    });

    const debouncedFilterCourses = debounce((searchTerm) => filterGrid(searchTerm, '#courses-grid', '.course-card-clickable'), 300);
    const debouncedFilterAssignments = debounce((searchTerm) => filterGrid(searchTerm, '#assignments-list', '.assignment-item'), 300);
    const debouncedFilterGpa = debounce((searchTerm) => filterTable(searchTerm, '#gpa-courses-tbody'), 300);

    document.getElementById('courses-search').addEventListener('keyup', (e) => debouncedFilterCourses(e.target.value));
    document.getElementById('assignments-search').addEventListener('keyup', (e) => debouncedFilterAssignments(e.target.value));
    document.getElementById('gpa-search').addEventListener('keyup', (e) => debouncedFilterGpa(e.target.value));

    document.getElementById('prev-month-btn').addEventListener('click', () => {
        state.currentCalendarDate.setMonth(state.currentCalendarDate.getMonth() - 1);
        renderCalendar();
        saveData();
    });
    document.getElementById('next-month-btn').addEventListener('click', () => {
        state.currentCalendarDate.setMonth(state.currentCalendarDate.getMonth() + 1);
        renderCalendar();
        saveData();
    });

    document.getElementById('notification-toggle').addEventListener('change', handleNotificationToggle);
    document.getElementById('sidebar-nav').addEventListener('click', handleSidebarNav);

    document.getElementById('logout-btn').addEventListener('click', logoutUser);

    document.getElementById('show-forgot-password').addEventListener('click', (e) => {
        e.preventDefault();
        toggleModal(document.getElementById('forgot-password-modal'), true);
    });

    document.getElementById('forgot-password-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('reset-contact').value;
        if (!email || !email.includes('@')) {
            showToast("Please enter a valid email address.", "error");
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            showToast(`Password reset email sent to ${email}. Check your inbox.`, 'success');
            toggleModal(document.getElementById('forgot-password-modal'), false);
        } catch (error) {
            showToast(error.message, "error");
        }
    });
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then((registration) => {
        registration.update().catch(() => { });
    }).catch(() => { });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAttendora);
} else {
    initializeAttendora();
}
