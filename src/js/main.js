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
    initGoogleAuth();

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
    let pendingRenderFrame = null;
    window.addEventListener('attendora-update-ui', () => {
        if (pendingRenderFrame) cancelAnimationFrame(pendingRenderFrame);
        pendingRenderFrame = requestAnimationFrame(() => {
            pendingRenderFrame = null;
            updateAllViews();
        });
    });

    document.getElementById('go-to-login-btn').addEventListener('click', (e) => { e.preventDefault(); showAuthPage(); });
    document.getElementById('go-to-login-landing-btn').addEventListener('click', (e) => { e.preventDefault(); showAuthPage(); });
    document.getElementById('google-signin-btn').addEventListener('click', signInWithGoogle);

    document.getElementById('mobile-menu-btn').addEventListener('click', toggleMobileSidebar);
    const bottomMobileMenuBtn = document.querySelector('#mobile-bottom-nav #mobile-menu-btn');
    if (bottomMobileMenuBtn) {
        bottomMobileMenuBtn.addEventListener('click', toggleMobileSidebar);
    }
    
    const mobileBottomNav = document.getElementById('mobile-bottom-nav');
    if (mobileBottomNav) {
        mobileBottomNav.addEventListener('click', handleSidebarNav);
    }

    document.getElementById('close-sidebar-btn').addEventListener('click', closeMobileSidebar);
    document.getElementById('sidebar-overlay').addEventListener('click', closeMobileSidebar);

    document.body.addEventListener('click', (e) => {
        if (e.target.closest('.close-modal-btn')) {
            toggleModal(e.target.closest('.modal-overlay'), false);
        }
    });

    document.getElementById('class-form').addEventListener('submit', handleClassFormSubmit);
    document.getElementById('assignment-form').addEventListener('submit', handleAssignmentFormSubmit);
    document.getElementById('notes-form').addEventListener('submit', handleNoteSubmit);

    document.getElementById('start-time').addEventListener('input', updateDurationFeedback);
    document.getElementById('end-time').addEventListener('input', updateDurationFeedback);

    document.getElementById('add-class-btn').addEventListener('click', () => openClassModal(null, 'Class'));
    document.getElementById('add-assignment-btn').addEventListener('click', () => openAssignmentModal());

    document.getElementById('settings-btn').addEventListener('click', () => {
        updateTermDatesUI();
        renderArchivedTermsList();

        const generalTabBtn = document.querySelector('.settings-tab-btn[data-tab="settings-general"]');
        if (generalTabBtn) {
            generalTabBtn.click();
        }
        
        toggleModal(document.getElementById('settings-modal'), true);
    });

    document.getElementById('profile-btn').addEventListener('click', () => {
        
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

    document.getElementById('export-data-btn').addEventListener('click', exportData);
    document.getElementById('import-data-input').addEventListener('change', importData);
    const wrappedBtn = document.getElementById('semester-wrapped-btn');
    if (wrappedBtn) wrappedBtn.addEventListener('click', generateSemesterWrapped);
    const shareWrappedBtn = document.getElementById('share-wrapped-btn');
    if (shareWrappedBtn) shareWrappedBtn.addEventListener('click', shareSemesterWrapped);

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

        const noteBtn = e.target.closest('.add-note-btn');
        if (noteBtn) {
            openNoteModal(parseInt(noteBtn.dataset.historyId));
            return;
        }
    });

    document.getElementById('course-details-modal').addEventListener('click', (e) => {
        const noteBtn = e.target.closest('.add-note-btn');
        if (noteBtn) {
            openNoteModal(parseInt(noteBtn.dataset.historyId));
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

    document.getElementById('courses-search').addEventListener('keyup', (e) => debouncedFilterCourses(e.target.value));
    document.getElementById('assignments-search').addEventListener('keyup', (e) => debouncedFilterAssignments(e.target.value));

    document.getElementById('prev-month-btn').addEventListener('click', () => {
        if (!(state.currentCalendarDate instanceof Date) || isNaN(state.currentCalendarDate.getTime())) {
            state.currentCalendarDate = new Date(state.currentCalendarDate || Date.now());
        }
        state.currentCalendarDate.setMonth(state.currentCalendarDate.getMonth() - 1);
        renderCalendar();
        saveData();
    });
    document.getElementById('next-month-btn').addEventListener('click', () => {
        if (!(state.currentCalendarDate instanceof Date) || isNaN(state.currentCalendarDate.getTime())) {
            state.currentCalendarDate = new Date(state.currentCalendarDate || Date.now());
        }
        state.currentCalendarDate.setMonth(state.currentCalendarDate.getMonth() + 1);
        renderCalendar();
        saveData();
    });

    document.getElementById('notification-toggle').addEventListener('change', handleNotificationToggle);
    document.getElementById('sidebar-nav').addEventListener('click', handleSidebarNav);

    document.getElementById('logout-btn').addEventListener('click', logoutUser);
    document.getElementById('mobile-logout-btn').addEventListener('click', logoutUser);

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
