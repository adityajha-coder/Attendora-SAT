import { initVisuals } from './utils.js';

export const THEMES = {
    'default': { name: 'Default', start: '#3b82f6', end: '#8b5cf6' },
    'sunset': { name: 'Sunset', start: '#f97316', end: '#ef4444' },
    'ocean': { name: 'Ocean', start: '#06b6d4', end: '#3b82f6' },
    'forest': { name: 'Forest', start: '#22c55e', end: '#15803d' },
};

export const state = {
    userProfile: { name: '', contact: '', course: '', year: '' }, 
    schedule: [],
    history: [], 
    assignments: [],
    gpaCourses: [], 
    archivedTerms: [], 
    achievements: {},
    settings: {
        notifications: false,
        isLightMode: false,
        selectedTheme: 'default',
        dashboardOrder: ['overview-card-attendance', 'overview-card-courses', 'overview-card-streaks', 'overview-card-countdown'], 
        hasCompletedTour: false,
        termStartDate: new Date().toISOString().slice(0, 10),
        termEndDate: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString().slice(0, 10),
        pomodoroWork: 25,
        pomodoroShortBreak: 5,
        pomodoroLongBreak: 20,
    },
    currentCalendarDate: new Date(),
    pomodoro: {
        timerId: null,
        timeLeft: 25 * 60,
        isRunning: false,
        isPomodoroVisible: false,
        sessionsCompleted: 0,
        mode: 'work' 
    },
    editingAttendance: {
        classId: null,
        historyId: null,
        courseName: null,
    }
};

export const visuals = initVisuals();

export const saveData = () => {
    localStorage.setItem('attendoraState', JSON.stringify(state));
};

export const loadData = () => {
    const savedState = localStorage.getItem('attendoraState');
    if (savedState) {
        const loadedState = JSON.parse(savedState);
        Object.assign(state, loadedState, {
            userProfile: { name: '', ...state.userProfile, ...(loadedState.userProfile || {}) },
            settings: { ...state.settings, ...(loadedState.settings || {}) },
            pomodoro: { ...state.pomodoro, ...(loadedState.pomodoro || {}) }
        });
        state.currentCalendarDate = new Date(loadedState.currentCalendarDate);
        if (state.pomodoro.timerId) {
            clearInterval(state.pomodoro.timerId);
            state.pomodoro.timerId = null;
            state.pomodoro.isRunning = false;
        }
        if (loadedState.settings) {
            state.pomodoro.timeLeft = (state.settings.pomodoroWork || 25) * 60;
        }
        if (loadedState.userProfile) {
            if (!loadedState.userProfile.contact) {
                 state.userProfile.contact = loadedState.userProfile.email || loadedState.userProfile.mobile || '';
            }
            delete state.userProfile.email;
            delete state.userProfile.mobile;
            delete state.userProfile.rollNumber; 
        }
        const requiredOrder = ['overview-card-attendance', 'overview-card-courses', 'overview-card-streaks', 'overview-card-countdown'];
        if (loadedState.settings && loadedState.settings.dashboardOrder) {
            state.settings.dashboardOrder = loadedState.settings.dashboardOrder.filter(id => requiredOrder.includes(id));
        } else {
            state.settings.dashboardOrder = requiredOrder;
        }
    }
    applyTheme(state.settings.selectedTheme);
    applyLightMode(state.settings.isLightMode);
};

export const applyTheme = (themeName) => {
    const theme = THEMES[themeName] || THEMES['default'];
    const root = document.documentElement;
    root.style.setProperty('--primary-color-start', theme.start);
    root.style.setProperty('--primary-color-end', theme.end);
    state.settings.selectedTheme = themeName;
};

export const applyLightMode = (isLight) => {
    document.body.classList.toggle('light-mode', isLight);
    const toggleBtn = document.getElementById('theme-toggle');
    if(toggleBtn) toggleBtn.checked = isLight;
    const canvasEl = document.getElementById('shooting-stars-canvas');
    if (isLight) {
        if(canvasEl) canvasEl.style.opacity = '0';
        visuals?.stopAnimate();
    } else {
        if(canvasEl) canvasEl.style.opacity = '1';
        visuals?.initStars();
        visuals?.animate();
    }
    state.settings.isLightMode = isLight;
};

export function dateIsWithinTerm(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const start = new Date(state.settings.termStartDate + 'T00:00:00');
    const end = new Date(state.settings.termEndDate + 'T23:59:59'); 
    return date >= start && date <= end;
}