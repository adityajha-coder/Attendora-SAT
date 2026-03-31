import { authHtml } from './components/auth-html.js';
import { landingHtml } from './components/landing-html.js';
import { dashboardHtml } from './components/dashboard-html.js';
import { modalsHtml } from './components/modals-html.js';
import { handleNotificationToggle, checkNotificationStatus, requestNotificationPermission, handleSidebarNav, navigateTo, updateOverviewStats, updateGoalOrientedCard, updateNextClassCountdown, renderArchivedTermsList, toggleArchivedTermsList, updateTermDatesUI, saveTermDates, archiveCurrentTerm, exportHistoryToCSV, exportData, importData, renderOverviewCards, startOnboardingTour } from './app-helpers.js';
import { debounce } from './utils.js';
import { state, saveData, loadData, applyTheme, dateIsWithinTerm } from './state.js';
import { renderThemePicker, setupDraggableOverviewCards, toggleModal, showToast, showConfirmationModal, filterGrid, filterTable, renderCalendar } from './ui.js';
import { loginUser, handleSignup, openOtpModal, openResetPasswordModal, forgotPasswordContact, renderProfile, openEditProfileModal } from './auth.js';
import { renderSchedule, renderTodaysClasses, openClassModal, populateModalForEdit, handleDeleteClass, handleClassFormSubmit, openTimetableScanner, handleTimetableScan, handleSaveScannedSchedule, updateDurationFeedback, handleDurationPreset } from './schedule.js';
import { handleAttendanceAction, openEditAttendanceModal, autoMarkMissedClasses, calculateOverallAttendance, calculateStreak, calculateAttendanceForCourse, renderReports, renderCourses } from './attendance.js';
import { renderAssignments, handleAssignmentFormSubmit, handleDeleteAssignment, openAssignmentModal, renderGpaCalculator, handleGpaFormSubmit, handleDeleteGpaCourse, openGpaModal, openNoteModal, handleNoteSubmit, showCourseDetails } from './academics.js';
import { ALL_ACHIEVEMENTS, checkAchievements, renderAchievements, generateSemesterWrapped, shareSemesterWrapped } from './gamification.js';

let countdownInterval = null;

export const showDashboard = () => {
    document.getElementById('auth-page').classList.add('hidden');
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('dashboard-app').classList.remove('hidden');
    initializeDashboard();
};

const showLandingPage = () => {
    document.getElementById('dashboard-app').classList.add('hidden');
    document.getElementById('auth-page').classList.add('hidden');
    document.getElementById('landing-page').classList.remove('hidden');
};

const showAuthPage = (showLogin = true) => {
    document.getElementById('dashboard-app').classList.add('hidden');
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('auth-page').classList.remove('hidden');
    document.getElementById('login-form').classList.toggle('hidden', !showLogin);
    document.getElementById('signup-form').classList.toggle('hidden', showLogin);
};

const initializeApp = () => {
    document.getElementById('app').innerHTML = authHtml + landingHtml + dashboardHtml + modalsHtml;

    loadData();
    setupEventListeners();
    if (localStorage.getItem('loggedIn')) {
        showDashboard();
    } else {
        showLandingPage();
    }
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
    addAssignmentBtn.disabled = !hasCourses;
    addAssignmentBtn.classList.toggle('opacity-50', !hasCourses);
    addAssignmentBtn.classList.toggle('cursor-not-allowed', !hasCourses);
    addAssignmentBtn.title = hasCourses ? '' : 'Please add a course first before adding an assignment.';
};

function setupEventListeners() {
    document.getElementById('show-signup').addEventListener('click', (e) => { e.preventDefault(); showAuthPage(false); });
    document.getElementById('show-login').addEventListener('click', (e) => { e.preventDefault(); showAuthPage(true); });
    document.getElementById('go-to-login-btn').addEventListener('click', (e) => { e.preventDefault(); showAuthPage(true); });
    document.getElementById('go-to-signup-btn').addEventListener('click', (e) => { e.preventDefault(); showAuthPage(false); });
    
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const contact = document.getElementById('login-contact').value;
        if (!state.userProfile.contact) {
            state.userProfile.contact = contact;
            state.userProfile.name = contact.includes('@') ? contact.split('@')[0] : 'Guest';
            state.userProfile.course = 'B.Tech CSE';
            state.userProfile.year = '2';
            saveData();
        }
        loginUser(contact);
    });

    document.getElementById('signup-form').addEventListener('submit', handleSignup);
    
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    document.getElementById('mobile-menu-btn').addEventListener('click', () => {
        sidebar.classList.remove('-translate-x-full');
        sidebarOverlay.classList.remove('hidden', 'opacity-0');
    });
    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
        sidebarOverlay.classList.add('hidden', 'opacity-0');
    });

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
    
    setupDraggableOverviewCards();

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('loggedIn');
        window.location.reload(); 
    });

    document.getElementById('show-forgot-password').addEventListener('click', (e) => {
        e.preventDefault();
        toggleModal(document.getElementById('forgot-password-modal'), true);
    });

    document.getElementById('forgot-password-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const contact = document.getElementById('reset-contact').value;
        if (!contact) {
            showToast("Please enter a valid contact method.", "error");
            return;
        }
        
        showToast(`Verification code sent to ${contact}. (Hint: 123456)`, 'success');
        toggleModal(document.getElementById('forgot-password-modal'), false);
        openResetPasswordModal(contact);
    });
    
    document.getElementById('reset-password-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const code = document.getElementById('reset-code-input').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-new-password').value;

        if (code !== '123456') {
            showToast("Invalid verification code.", "error");
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast("New passwords do not match.", "error");
            return;
        }
        
        showToast(`Password successfully reset!`, 'success');
        toggleModal(document.getElementById('reset-password-modal'), false);
        showAuthPage(true); 
    });

    document.getElementById('back-to-login-btn').addEventListener('click', () => {
        toggleModal(document.getElementById('reset-password-modal'), false);
        showAuthPage(true); 
    });

    document.getElementById('otp-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const otp = document.getElementById('otp-input').value;
        if (otp === '123456') { 
            toggleModal(document.getElementById('otp-modal'), false);
            saveData();
            loginUser(state.userProfile.contact);
            showToast("Account verified and setup complete!", "success");
        } else {
            showToast("Invalid OTP. Please try again or resend the code.", "error");
        }
    });

    document.getElementById('resend-reset-code-btn').addEventListener('click', () => {
        showToast("A new verification code has been sent.", "warning");
    });
    document.getElementById('resend-otp-btn').addEventListener('click', () => {
        showToast("A new OTP has been sent to your registered contact.", "warning");
    });
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
}

document.addEventListener('DOMContentLoaded', initializeApp);