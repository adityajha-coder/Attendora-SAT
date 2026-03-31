import { state, saveData, dateIsWithinTerm } from './state.js';
import { calculateOverallAttendance, calculateStreak, calculateAttendanceForCourse, renderReports } from './attendance.js';
import { showToast, showConfirmationModal, toggleModal } from './ui.js';
import { updateAllViews, setCountdownInterval } from './main.js';

// We get countdownInterval from main.js dynamically or pass it
let countdownInterval = null;
export function getCountdownInterval() { return countdownInterval; }
export function updateInterval(v) { countdownInterval = v; }

export function handleNotificationToggle(e) {
    const isEnabled = e.target.checked;
    state.settings.notifications = isEnabled;
    if (isEnabled) {
        requestNotificationPermission();
    }
    saveData();
}

export const checkNotificationStatus = () => {
    const toggle = document.getElementById('notification-toggle');
    const statusText = document.getElementById('notification-status-text');
    if (!("Notification" in window)) {
        toggle.disabled = true;
        statusText.textContent = "Notifications are not supported by your browser.";
        return;
    }
    toggle.checked = state.settings.notifications && Notification.permission === 'granted';
    if (Notification.permission === "granted") {
        statusText.textContent = "Reminders are enabled.";
    } else if (Notification.permission === "denied") {
        statusText.textContent = "Reminders are blocked in your browser settings.";
        toggle.disabled = true;
    } else {
            statusText.textContent = "Allow notifications to get class reminders.";
    }
};

export const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
        showToast("Notifications enabled!");
        state.settings.notifications = true;
    } else {
        showToast("Notifications were not enabled.", "error");
        state.settings.notifications = false;
    }
    saveData();
    checkNotificationStatus();
};

export function handleSidebarNav(e) {
    e.preventDefault();
    const link = e.target.closest('a.sidebar-link');
    if (!link) return;
    navigateTo(link.getAttribute('href').substring(1));
    if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.add('-translate-x-full');
        document.getElementById('sidebar-overlay').classList.add('hidden', 'opacity-0');
    }
}

export function navigateTo(viewId) {
        document.querySelectorAll('#sidebar-nav a').forEach(a => a.classList.remove('active'));
    const link = document.querySelector(`#sidebar-nav a[href="#${viewId}"]`);
    if(link) link.classList.add('active');
    const targetId = viewId + '-view';
    document.querySelectorAll('.dashboard-view').forEach(view => {
        const wasActive = view.classList.contains('active');
        const isActive = view.id === targetId;
        view.classList.toggle('active', isActive);
        if (isActive && !wasActive && (targetId === 'reports-view' || targetId === 'overview-view')) {
                setTimeout(() => {
                renderReports();
                }, 50); 
        }
    });
}

export function updateOverviewStats() {
    const { percentage: overallPercentage } = calculateOverallAttendance();
    const uniqueCourses = [...new Set(state.schedule.map(item => item.name))];
    let longestStreak = 0;
    if (uniqueCourses.length > 0) {
            longestStreak = Math.max(0, ...uniqueCourses.map(calculateStreak));
    }
    let percentageColorClass = 'text-red-400';
    if (overallPercentage >= 90) percentageColorClass = 'text-green-400';
    else if (overallPercentage >= 75) percentageColorClass = 'text-yellow-400';
    document.getElementById('overview-attendance').textContent = `${overallPercentage}%`;
    const attendanceEl = document.getElementById('overview-attendance');
    attendanceEl.classList.remove('text-red-400', 'text-yellow-400', 'text-green-400');
    attendanceEl.classList.add(percentageColorClass);
    document.getElementById('overview-courses').textContent = uniqueCourses.length;
    document.getElementById('overview-streaks').textContent = `${longestStreak} 🔥`;
}

export function updateGoalOrientedCard() {
    const card = document.getElementById('goal-oriented-card');
    const text = document.getElementById('goal-text');
    const uniqueCourses = [...new Set(state.schedule.map(item => item.name))];
    let shouldShowCard = false;
    for (const courseName of uniqueCourses) {
        const stats = calculateAttendanceForCourse(courseName);
        const goal = 75; 
        if (stats.total > 0 && stats.percentage < goal) {
            const needed = Math.ceil(( (goal/100) * stats.absent - (1 - (goal/100)) * stats.present) / (1 - (goal/100)) );
            if(needed > 0) {
                text.textContent = `You need to attend the next ${needed} classes of ${courseName} to reach ${goal}% attendance.`;
                text.style.color = state.settings.isLightMode ? '#ca8a04' : '#facc15'; 
                shouldShowCard = true;
                break;
            }
        }
    }
    card.classList.toggle('hidden', !shouldShowCard);
}

export function updateNextClassCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);
    const countdownEl = document.getElementById('overview-countdown');
    const countdownNameEl = document.getElementById('overview-countdown-classname');
    const now = new Date();
    const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let nextClass = null;
    for (let i = 0; i < 7; i++) {
        const checkDate = new Date(now);
        checkDate.setDate(now.getDate() + i);
        const dayName = dayMap[checkDate.getDay()];
        const dateStr = checkDate.toISOString().slice(0, 10);
        if (!dateIsWithinTerm(dateStr)) continue;
        const classesOnDay = state.schedule
            .filter(c => c.day === dayName)
            .sort((a, b) => a.start.localeCompare(b.start));
        for (const c of classesOnDay) {
            const [hours, minutes] = c.start.split(':');
            const classTime = new Date(checkDate);
            classTime.setHours(hours, minutes, 0, 0);
            if (classTime > now) {
                nextClass = { ...c, time: classTime, dayOffset: i };
                break;
            }
        }
        if (nextClass) break;
    }
    if (!nextClass) {
        countdownEl.textContent = 'No upcoming classes';
        if (!dateIsWithinTerm(now.toISOString().slice(0, 10))) {
            countdownNameEl.textContent = `Term ended ${new Date(state.settings.termEndDate + 'T00:00:00').toLocaleDateString()}`;
        } else {
                countdownNameEl.textContent = state.schedule.length > 0 ? 'Wait for the next day' : 'Add classes to schedule.';
        }
        return;
    }
    const dayLabel = nextClass.dayOffset === 0 ? 'Today' : nextClass.dayOffset === 1 ? 'Tomorrow' : nextClass.day;
    const classTimeStr = nextClass.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    countdownNameEl.textContent = `${nextClass.name} on ${dayLabel} at ${classTimeStr}`;
    const update = () => {
        const diff = nextClass.time - new Date();
        if (diff <= 0) {
            countdownEl.textContent = 'Starting now!';
            clearInterval(countdownInterval);
            return;
        }
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        if (d > 0) countdownEl.textContent = `${d}d ${h}h`;
        else if (h > 0) countdownEl.textContent = `${h}h ${m}m`;
        else if (m > 0) countdownEl.textContent = `${m}m ${s}s`;
        else countdownEl.textContent = `${s}s`;
    };
    update();
    countdownInterval = setInterval(update, 1000);
}

export function renderArchivedTermsList() {
    const listContainer = document.getElementById('archived-terms-list');
    const countSpan = document.getElementById('archived-count');
    const button = document.getElementById('view-archived-terms-btn');
    countSpan.textContent = state.archivedTerms.length;
    if (state.archivedTerms.length === 0) {
        listContainer.innerHTML = `<p class="text-sm text-gray-500 italic p-2 text-center">No previous terms archived.</p>`;
        button.disabled = true;
        return;
    }
    button.disabled = false;
    listContainer.innerHTML = state.archivedTerms.map(term => {
        const start = new Date(term.startDate + 'T00:00:00').toLocaleDateString();
        const end = new Date(term.endDate + 'T00:00:00').toLocaleDateString();
        return `
            <div class="p-2 bg-white/5 rounded-lg text-sm">
                <p class="font-semibold text-white">${term.name}</p>
                <p class="text-xs text-gray-400">Archived: ${new Date(term.archiveDate).toLocaleDateString()} (${start} to ${end})</p>
            </div>
        `;
    }).join('');
}

export function toggleArchivedTermsList() {
        const listContainer = document.getElementById('archived-terms-list');
        listContainer.classList.toggle('hidden');
        const button = document.getElementById('view-archived-terms-btn');
        if (!listContainer.classList.contains('hidden')) {
            button.innerHTML = `Hide Archived Terms (<span id="archived-count">${state.archivedTerms.length}</span>)`;
        } else {
            button.innerHTML = `View Archived Terms (<span id="archived-count">${state.archivedTerms.length}</span>)`;
        }
}

export function updateTermDatesUI() {
    document.getElementById('term-start-date').value = state.settings.termStartDate || '';
    document.getElementById('term-end-date').value = state.settings.termEndDate || '';
    const termStart = state.settings.termStartDate;
    const termEnd = state.settings.termEndDate;
    let dateText = 'N/A';
    if (termStart && termEnd) {
        dateText = `${new Date(termStart + 'T00:00:00').toLocaleDateString()} - ${new Date(termEnd + 'T00:00:00').toLocaleDateString()}`;
    }
    document.getElementById('current-term-dates').textContent = dateText;
    renderArchivedTermsList(); 
}

export function saveTermDates() {
    const startDate = document.getElementById('term-start-date').value;
    const endDate = document.getElementById('term-end-date').value;
    if (startDate && endDate) {
        if (new Date(startDate) > new Date(endDate)) {
            showToast("Start date cannot be after end date.", "error");
            return;
        }
        state.settings.termStartDate = startDate;
        state.settings.termEndDate = endDate;
        saveData();
        updateTermDatesUI();
        updateAllViews();
        showToast("Term dates saved!");
        toggleModal(document.getElementById('settings-modal'), false); 
    } else {
        showToast("Please select both start and end dates.", "error");
    }
}

export function archiveCurrentTerm() {
    showConfirmationModal(
        "Archive Current Term?",
        "This will save your current schedule, history, assignments, and GPA courses as an archived semester, then clear your current data to start fresh. Are you sure?",
        () => {
            const termName = `Term ${state.archivedTerms.length + 1} (${state.settings.termStartDate} - ${state.settings.termEndDate})`;
            const archiveEntry = {
                name: termName,
                schedule: state.schedule,
                history: state.history,
                assignments: state.assignments,
                gpaCourses: state.gpaCourses,
                startDate: state.settings.termStartDate,
                endDate: state.settings.termEndDate,
                archiveDate: new Date().toISOString().slice(0, 10)
            };
            state.archivedTerms.push(archiveEntry);
            state.schedule = [];
            state.history = [];
            state.assignments = [];
            state.gpaCourses = [];
            state.achievements = {}; 
            state.settings.termStartDate = new Date().toISOString().slice(0, 10);
            state.settings.termEndDate = new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString().slice(0, 10);
            saveData();
            updateTermDatesUI();
            updateAllViews();
            showToast(`Term '${termName}' archived! Start fresh now.`);
            toggleModal(document.getElementById('settings-modal'), false); 
        }
    );
}

export function exportHistoryToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,Date,Course,Status,Reason,Note\n";
    state.history.forEach(h => {
        const course = state.schedule.find(c => c.id === h.classId);
        if (course) {
            const row = [h.date, course.name, h.status, h.reason || '', `"${h.note || ''}"`].join(",");
            csvContent += row + "\r\n";
        }
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendora_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("History exported!");
}

export function exportData() {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const link = document.createElement("a");
    link.setAttribute("href", dataUri);
    link.setAttribute("download", "attendora_backup.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Data backup exported!");
}

export function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedState = JSON.parse(e.target.result);
            if (importedState.schedule && importedState.history) {
                Object.assign(state, importedState);
                saveData();
                showToast("Data imported successfully! Reloading...");
                setTimeout(() => window.location.reload(), 1500);
            } else {
                showToast("Invalid data file.", "error");
            }
        } catch (error) {
                showToast("Error reading the file. Make sure it's a valid JSON backup.", "error");
                console.error("Import error:", error);
        }
    };
    reader.readAsText(file);
}

export function renderOverviewCards() {
    const grid = document.getElementById('overview-grid');
    grid.innerHTML = ''; 
    const cardHTML = {
        'overview-card-attendance': `<div id="overview-card-attendance" class="card p-6 rounded-xl overview-card bg-gradient-to-r from-blue-900/40 to-blue-800/40" draggable="true"><h3 class="text-sm font-semibold pointer-events-none" style="color: var(--text-secondary);">ATTENDANCE RATIO</h3><p id="overview-attendance" class="text-4xl font-bold text-green-400 mt-1 pointer-events-none">-%</p></div>`,
        'overview-card-courses': `<div id="overview-card-courses" class="card p-6 rounded-xl overview-card bg-gradient-to-r from-purple-900/40 to-purple-800/40" draggable="true"><h3 class="text-sm font-semibold pointer-events-none" style="color: var(--text-secondary);">ACTIVE COURSES</h3><p id="overview-courses" class="text-4xl font-bold mt-1 pointer-events-none">0</p></div>`,
        'overview-card-streaks': `<div id="overview-card-streaks" class="card p-6 rounded-xl overview-card bg-gradient-to-r from-orange-900/40 to-orange-800/40" draggable="true"><h3 class="text-sm font-semibold pointer-events-none" style="color: var(--text-secondary);">LONGEST STREAK</h3><p id="overview-streaks" class="text-4xl font-bold text-orange-400 mt-1 pointer-events-none">0 🔥</p></div>`,
        'overview-card-countdown': `<div id="overview-card-countdown" class="card p-6 rounded-xl overview-card bg-gradient-to-r from-indigo-900/40 to-indigo-800/40" draggable="true"><h3 class="text-sm font-semibold pointer-events-none" style="color: var(--text-secondary);">NEXT CLASS IN</h3><p id="overview-countdown" class="text-2xl font-bold text-cyan-400 mt-1 pointer-events-none">No upcoming classes</p><p id="overview-countdown-classname" class="text-xs pointer-events-none" style="color: var(--text-secondary);"></p></div>`
    };
    const requiredOrder = ['overview-card-attendance', 'overview-card-courses', 'overview-card-streaks', 'overview-card-countdown'];
    state.settings.dashboardOrder = state.settings.dashboardOrder.filter(id => requiredOrder.includes(id));
    if (state.settings.dashboardOrder.length !== requiredOrder.length) {
        state.settings.dashboardOrder = requiredOrder;
    }
    state.settings.dashboardOrder.forEach(cardId => {
        if(cardHTML[cardId]) {
            grid.innerHTML += cardHTML[cardId];
        }
    });
}

export function startOnboardingTour() {
    const isLightMode = state.settings.isLightMode;
    const tourHighlightColor = isLightMode ? 'var(--primary-color-start)' : '#FACC15'; 
    const intro = introJs();
    intro.setOptions({
        steps: [
            {
                element: document.querySelector('#sidebar'),
                intro: "Welcome to Attendora! This is your navigation sidebar. Let's take a quick look around.",
                position: 'right'
            },
            {
                element: document.querySelector('a[href="#schedule"]'),
                intro: "To begin tracking, navigate to 'My Schedule' to input your classes.",
                position: 'right'
            },
            {
                element: document.querySelector('#add-class-btn'),
                intro: "Use this button to manually add classes or view the timetable scanner tool.",
                position: 'left'
            },
            {
                element: document.querySelector('#todays-schedule-card'),
                intro: "Your daily schedule appears here. Quickly mark or edit your attendance status and reason.",
                position: 'top'
            },
            {
                    element: document.querySelector('a[href="#achievements"]'),
                intro: "Check the Achievements view to see fun goals and track your progress toward them!",
                    position: 'right'
            },
                {
                    element: document.querySelector('a[href="#reports"]'),
                intro: "The Reports section shows attendance trends, allowing you to filter by week, month, or term.",
                    position: 'right'
            },
            {
                element: document.querySelector('a[href="#gpa"]'),
                intro: "Use the GPA Calculator to manage your course grades and estimated progress.",
                position: 'right'
            },
            {
                element: document.querySelector('a[href="#profile"]'),
                intro: "Your Profile contains all personal and institutional data.",
                position: 'right'
            },
            {
                    element: document.querySelector('#settings-btn'),
                intro: "Finally, customize your entire app experience here: themes, term dates, data export, and more.",
                    position: 'top'
            }
        ],
        showProgress: true,
        showBullets: false,
        buttonClass: `bg-[${tourHighlightColor}] text-white px-4 py-2 rounded-lg font-bold`,
        tooltipClass: isLightMode ? 'introjs-light-mode' : 'introjs-dark-mode', 
    });
    intro.oncomplete(() => {
        state.settings.hasCompletedTour = true;
        saveData();
    });
    intro.onexit(() => {
        state.settings.hasCompletedTour = true;
        saveData();
    });
    intro.start();
}

