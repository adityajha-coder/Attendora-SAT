import { authHtml } from './components/auth-html.js';
import { landingHtml } from './components/landing-html.js';
import { dashboardHtml } from './components/dashboard-html.js';
import { modalsHtml } from './components/modals-html.js';
import { updateOverviewStats, updateGoalOrientedCard, updateNextClassCountdown, renderArchivedTermsList, toggleArchivedTermsList, updateTermDatesUI, saveTermDates, archiveCurrentTerm, renderOverviewCards } from './services/app-helpers.js';
import { checkNotificationStatus, handleNotificationToggle } from './ui/notifications.js';
import { exportData, importData } from './services/data.js';
import { openTimetableScanner, handleTimetableScan, handleSaveScannedSchedule } from './features/scanner.js';
import { handleSidebarNav, toggleMobileSidebar, closeMobileSidebar } from './ui/sidebar.js';
import { debounce } from './core/utils.js';
import { state, saveData, loadData, applyTheme, applyLightMode } from './core/state.js';
import { renderThemePicker, toggleModal, showToast, filterGrid, filterTable, renderCalendar } from './ui/ui.js';
import { logoutUser, renderProfile, openEditProfileModal, signInWithGoogle, initGoogleAuth } from './auth/auth.js';
import { getCurrentUser } from './core/api-client.js';

import { loadFromCloud, mergeCloudData, forceCloudSave } from './services/cloud-sync.js';
import { renderSchedule, renderTodaysClasses, openClassModal, populateModalForEdit, handleDeleteClass, handleClassFormSubmit, updateDurationFeedback, handleDurationPreset } from './features/schedule.js';
import { handleAttendanceAction, openEditAttendanceModal, autoMarkMissedClasses, renderReports, renderCourses } from './features/attendance.js';
import { renderAssignments, handleAssignmentFormSubmit, handleDeleteAssignment, openAssignmentModal, openNoteModal, handleNoteSubmit, showCourseDetails } from './features/academics.js';
import { generateSemesterWrapped, shareSemesterWrapped } from './features/gamification.js';

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

const showAuthPage = () => {
    document.getElementById('dashboard-app').classList.add('hidden');
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('auth-page').classList.remove('hidden');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('edit-profile-form').classList.add('hidden');
    dismissLoader();
    initGoogleAuth();
};

const initializeAttendora = async () => {
    document.getElementById('app').innerHTML = authHtml + landingHtml + dashboardHtml + modalsHtml;

    loadData();
    setupEventListeners();

    // Safety fallback: ensure loader is dismissed even if network or API hangs
    setTimeout(() => dismissLoader(), 3500);

    const urlParams = new URLSearchParams(window.location.search);
    const authError = urlParams.get('error');
    if (authError) {
        showToast("Login Error: " + decodeURIComponent(authError), "error");
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    try {
        const user = await getCurrentUser();
        if (user) {
            const syncIndicator = document.getElementById('cloud-sync-indicator');
            if (syncIndicator) syncIndicator.style.display = 'flex';

            try {
                const cloudData = await loadFromCloud();
                if (cloudData) {
                    const wasMerged = mergeCloudData(state, cloudData);
                    if (wasMerged) {
                        saveData();
                    }
                }
            } catch (syncErr) {
                console.warn('[Sync] Cloud restore warning:', syncErr);
            }
            showDashboard();
        } else {
            showLandingPage();
        }
    } catch (error) {
        console.warn('[Auth] Auth check failed:', error);
        showLandingPage();
    } finally {
        dismissLoader();
        initGoogleAuth();
    }
};

export let currentView = 'overview';
export const dirtyViews = new Set();

const viewRenderers = {
    'overview':     () => { renderOverviewCards(); renderTodaysClasses(); updateOverviewStats(); updateGoalOrientedCard(); updateNextClassCountdown(); },
    'schedule':     () => { renderSchedule(); },
    'courses':      () => { renderCourses(); },
    'assignments':  () => { renderAssignments(); },
    'calendar':     () => { renderCalendar(); },
    'reports':      () => { renderReports(); },
    'profile':      () => { renderProfile(); }
};

export function setCurrentView(viewId) {
    currentView = viewId;
}

export function renderView(viewId) {
    const renderer = viewRenderers[viewId];
    if (renderer) renderer();
    dirtyViews.delete(viewId);
}

const initializeDashboard = () => {
    autoMarkMissedClasses();
    renderThemePicker();
    checkNotificationStatus();
    updateTermDatesUI();
    fullRenderAllViews();
};

function fullRenderAllViews() {
    renderOverviewCards();
    renderSchedule();
    renderTodaysClasses();
    renderCourses();
    renderAssignments();
    renderCalendar();
    renderReports();
    renderProfile();
    updateOverviewStats();
    updateGoalOrientedCard();
    updateNextClassCountdown();
    updateAssignmentBtnState();
    dirtyViews.clear();
}

export const updateAllViews = () => {
    updateOverviewStats();
    updateGoalOrientedCard();
    updateNextClassCountdown();
    updateAssignmentBtnState();

    renderView(currentView);

    for (const viewId of Object.keys(viewRenderers)) {
        if (viewId !== currentView) {
            dirtyViews.add(viewId);
        }
    }
};

function updateAssignmentBtnState() {
    const addAssignmentBtn = document.getElementById('add-assignment-btn');
    const hasCourses = state.schedule.length > 0;
    if (addAssignmentBtn) {
        addAssignmentBtn.disabled = !hasCourses;
        addAssignmentBtn.classList.toggle('opacity-50', !hasCourses);
        addAssignmentBtn.classList.toggle('cursor-not-allowed', !hasCourses);
        addAssignmentBtn.title = hasCourses ? '' : 'Please add a course first before adding an assignment.';
    }
}

function setupEventListeners() {
    const addListener = (id, event, handler) => {
        const el = typeof id === 'string' ? document.getElementById(id) : id;
        if (el) el.addEventListener(event, handler);
    };

    let pendingRenderFrame = null;
    window.addEventListener('attendora-update-ui', () => {
        if (pendingRenderFrame) cancelAnimationFrame(pendingRenderFrame);
        pendingRenderFrame = requestAnimationFrame(() => {
            pendingRenderFrame = null;
            updateAllViews();
        });
    });

    addListener('go-to-login-btn', 'click', (e) => { e.preventDefault(); showAuthPage(); });
    addListener('go-to-login-landing-btn', 'click', (e) => { e.preventDefault(); showAuthPage(); });
    addListener('google-signin-btn', 'click', signInWithGoogle);

    addListener('mobile-menu-btn', 'click', toggleMobileSidebar);
    const bottomMobileMenuBtn = document.querySelector('#mobile-bottom-nav #mobile-menu-btn');
    if (bottomMobileMenuBtn) {
        bottomMobileMenuBtn.addEventListener('click', toggleMobileSidebar);
    }
    
    const mobileBottomNav = document.getElementById('mobile-bottom-nav');
    if (mobileBottomNav) {
        mobileBottomNav.addEventListener('click', handleSidebarNav);
    }

    addListener('close-sidebar-btn', 'click', closeMobileSidebar);
    addListener('sidebar-overlay', 'click', closeMobileSidebar);

    document.body.addEventListener('click', (e) => {
        if (e.target.closest('.close-modal-btn')) {
            toggleModal(e.target.closest('.modal-overlay'), false);
        }
    });

    addListener('class-form', 'submit', handleClassFormSubmit);
    addListener('assignment-form', 'submit', handleAssignmentFormSubmit);
    addListener('notes-form', 'submit', handleNoteSubmit);

    addListener('start-time', 'input', updateDurationFeedback);
    addListener('end-time', 'input', updateDurationFeedback);

    addListener('add-class-btn', 'click', () => openClassModal(null, 'Class'));
    addListener('add-assignment-btn', 'click', () => openAssignmentModal());

    addListener('settings-btn', 'click', () => {
        updateTermDatesUI();
        renderArchivedTermsList();

        const generalTabBtn = document.querySelector('.settings-tab-btn[data-tab="settings-general"]');
        if (generalTabBtn) {
            generalTabBtn.click();
        }
        
        toggleModal(document.getElementById('settings-modal'), true);
    });

    addListener('profile-btn', 'click', () => {
        const overviewTabBtn = document.querySelector('.profile-tab-btn[data-tab="profile-overview"]');
        if (overviewTabBtn) {
            overviewTabBtn.click();
        }
        toggleModal(document.getElementById('profile-modal'), true);
        if (window.innerWidth < 768) closeMobileSidebar();
    });

    const mobileProfileBtn = document.getElementById('mobile-profile-btn');
    if (mobileProfileBtn) {
        mobileProfileBtn.addEventListener('click', () => {
            const overviewTabBtn = document.querySelector('.profile-tab-btn[data-tab="profile-overview"]');
            if (overviewTabBtn) overviewTabBtn.click();
            toggleModal(document.getElementById('profile-modal'), true);
        });
    }

    document.querySelectorAll('.profile-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetTabId = e.currentTarget.dataset.tab;

            document.querySelectorAll('.profile-tab-btn').forEach(b => {
                b.classList.remove('active', 'bg-white/10', 'text-white');
                b.classList.add('text-gray-400');
                b.classList.remove('hover:bg-white/10');
                b.classList.add('hover:bg-white/5');
            });
            e.currentTarget.classList.add('active', 'bg-white/10', 'text-white');
            e.currentTarget.classList.remove('text-gray-400', 'hover:bg-white/5');
            e.currentTarget.classList.add('hover:bg-white/10');

            document.querySelectorAll('.profile-tab-content').forEach(content => {
                content.classList.add('hidden');
                content.classList.remove('active');
            });
            const targetContent = document.getElementById(targetTabId);
            if (targetContent) {
                targetContent.classList.remove('hidden');
                targetContent.classList.add('active');
            }
        });
    });

    document.querySelectorAll('#edit-profile-btn').forEach(btn => {
        btn.addEventListener('click', openEditProfileModal);
    });

    addListener('export-data-btn', 'click', exportData);
    addListener('import-data-input', 'change', importData);
    const wrappedBtn = document.getElementById('semester-wrapped-btn');
    if (wrappedBtn) wrappedBtn.addEventListener('click', generateSemesterWrapped);
    const shareWrappedBtn = document.getElementById('share-wrapped-btn');
    if (shareWrappedBtn) shareWrappedBtn.addEventListener('click', shareSemesterWrapped);

    addListener('save-term-dates-btn', 'click', saveTermDates);
    addListener('archive-term-btn-danger', 'click', archiveCurrentTerm);
    addListener('reports-filter', 'change', renderReports);
    addListener('view-archived-terms-btn', 'click', toggleArchivedTermsList);

    addListener('schedule-view', 'click', (e) => {
        if (e.target.closest('#scan-timetable-btn') || e.target.closest('#scan-timetable-prompt-btn')) {
            openTimetableScanner();
        }
        if (e.target.closest('#add-class-prompt-btn')) {
            openClassModal();
        }
    });
    addListener('timetable-file-input', 'change', handleTimetableScan);
    addListener('save-scanned-schedule-btn', 'click', handleSaveScannedSchedule);

    addListener('settings-modal', 'click', (e) => {
        const swatch = e.target.closest('#theme-picker button');
        if (swatch) {
            applyTheme(swatch.dataset.theme);
            renderThemePicker();
            saveData();
        }
    });

    document.querySelectorAll('.settings-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetTabId = e.currentTarget.dataset.tab;

            document.querySelectorAll('.settings-tab-btn').forEach(b => {
                b.classList.remove('active', 'bg-white/10', 'text-white');
                b.classList.add('text-gray-400');
                b.classList.remove('hover:bg-white/10');
                b.classList.add('hover:bg-white/5');
            });
            e.currentTarget.classList.add('active', 'bg-white/10', 'text-white');
            e.currentTarget.classList.remove('text-gray-400', 'hover:bg-white/5');
            e.currentTarget.classList.add('hover:bg-white/10');

            document.querySelectorAll('.settings-tab-content').forEach(content => {
                content.classList.add('hidden');
                content.classList.remove('active');
            });
            const targetContent = document.getElementById(targetTabId);
            if (targetContent) {
                targetContent.classList.remove('hidden');
                targetContent.classList.add('active');
            }
        });
    });

    addListener('theme-toggle', 'change', (e) => {
        applyLightMode(e.target.checked);
        saveData();
    });

    addListener('dashboard-app', 'click', e => {
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

        const noteBtn = e.target.closest('.add-note-btn');
        if (noteBtn) {
            openNoteModal(parseInt(noteBtn.dataset.historyId));
            return;
        }
    });

    addListener('course-details-modal', 'click', (e) => {
        const noteBtn = e.target.closest('.add-note-btn');
        if (noteBtn) {
            openNoteModal(parseInt(noteBtn.dataset.historyId));
        }
    });

    addListener('edit-attendance-modal', 'click', (e) => {
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

    addListener('courses-search', 'keyup', (e) => debouncedFilterCourses(e.target.value));
    addListener('assignments-search', 'keyup', (e) => debouncedFilterAssignments(e.target.value));

    addListener('prev-month-btn', 'click', () => {
        if (!(state.currentCalendarDate instanceof Date) || isNaN(state.currentCalendarDate.getTime())) {
            state.currentCalendarDate = new Date(state.currentCalendarDate || Date.now());
        }
        state.currentCalendarDate.setMonth(state.currentCalendarDate.getMonth() - 1);
        renderCalendar();
        saveData();
    });
    addListener('next-month-btn', 'click', () => {
        if (!(state.currentCalendarDate instanceof Date) || isNaN(state.currentCalendarDate.getTime())) {
            state.currentCalendarDate = new Date(state.currentCalendarDate || Date.now());
        }
        state.currentCalendarDate.setMonth(state.currentCalendarDate.getMonth() + 1);
        renderCalendar();
        saveData();
    });

    addListener('notification-toggle', 'change', handleNotificationToggle);
    addListener('sidebar-nav', 'click', handleSidebarNav);

    addListener('logout-btn', 'click', logoutUser);
    addListener('mobile-logout-btn', 'click', logoutUser);
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
        registration.update().catch(() => { });
    }).catch(() => { });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAttendora);
} else {
    initializeAttendora();
}
