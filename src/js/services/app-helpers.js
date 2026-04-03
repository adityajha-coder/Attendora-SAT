import { state, saveData, dateIsWithinTerm } from '../core/state.js';
import { calculateOverallAttendance, calculateStreak, renderReports } from '../features/attendance.js';
import { toggleModal, showToast, showConfirmationModal } from '../ui/ui.js';

// We get countdownInterval from main.js dynamically or pass it
let countdownInterval = null;
export function getCountdownInterval() { return countdownInterval; }
export function updateInterval(v) { countdownInterval = v; }

export function updateOverviewStats() {
    const { percentage: overallPercentage, present, absent, total } = calculateOverallAttendance();
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

    const attendanceBar = document.getElementById('overview-attendance-bar');
    if (attendanceBar) {
        attendanceBar.style.width = `${overallPercentage}%`;
        attendanceBar.className = `h-1.5 rounded-full transition-all duration-1000 ${percentageColorClass.replace('text-', 'bg-')}`;
    }
    
    const totalClassesEl = document.getElementById('overview-total-classes');
    if (totalClassesEl) totalClassesEl.textContent = total;
    const presentClassesEl = document.getElementById('overview-present-classes');
    if (presentClassesEl) presentClassesEl.textContent = present;
    const absentClassesEl = document.getElementById('overview-absent-classes');
    if (absentClassesEl) absentClassesEl.textContent = absent;

    // Redesigned: Professional Segmented Progress Bar logic
    const totalTracked = present + absent;
    const presentBar = document.getElementById('overview-present-bar');
    const absentBar = document.getElementById('overview-absent-bar');
    if (presentBar && absentBar && totalTracked > 0) {
        presentBar.style.width = `${(present / totalTracked) * 100}%`;
        absentBar.style.width = `${(absent / totalTracked) * 100}%`;
    }

    // Top Bar Streak logic
    const topStreakCount = document.getElementById('top-streak-count');
    const topStreakIndicator = document.getElementById('top-streak-indicator');
    if (topStreakCount) topStreakCount.textContent = longestStreak;
    if (topStreakIndicator) {
        topStreakIndicator.classList.toggle('hidden', longestStreak === 0);
    }
}

export function updateGoalOrientedCard() {
    const card = document.getElementById('goal-oriented-card');
    const text = document.getElementById('goal-text');
    if (!state.settings.targetAttendance) {
        card.classList.add('hidden');
        return;
    }
    card.classList.remove('hidden');
    const { percentage } = calculateOverallAttendance();
    const target = state.settings.targetAttendance;
    if (percentage >= target) {
        text.textContent = `Goal Met! (${percentage}%) Keep it up! ✨`;
        card.style.borderColor = 'var(--accent-color)';
    } else {
        const gap = target - percentage;
        text.textContent = `You are ${gap.toFixed(1)}% away from your ${target}% target. Stay focused! 🚀`;
        card.style.borderColor = percentage < 75 ? 'rgb(248 113 113)' : 'rgb(250 204 21)';
    }
}

export function updateNextClassCountdown() {
    const countdownEl = document.getElementById('overview-countdown');
    const countdownNameEl = document.getElementById('overview-countdown-classname');
    if (!countdownEl) return;
    if (countdownInterval) clearInterval(countdownInterval);
    const now = new Date();
    const today = now.toLocaleString('en-US', { weekday: 'long' });
    const timeToDate = (time, offsetDays = 0) => {
        const [h, m] = time.split(':').map(Number);
        const d = new Date();
        d.setDate(d.getDate() + offsetDays);
        d.setHours(h, m, 0, 0);
        return d;
    };
    const upcoming = state.schedule.map(c => {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const targetDayIndex = daysOfWeek.indexOf(c.day);
        const currentDayIndex = now.getDay();
        let dayOffset = (targetDayIndex - currentDayIndex + 7) % 7;
        const classTime = timeToDate(c.start, dayOffset);
        if (dayOffset === 0 && classTime < now) {
            dayOffset = 7;
            classTime.setDate(classTime.getDate() + 7);
        }
        return { name: c.name, time: classTime, dayOffset, day: c.day };
    }).sort((a, b) => a.time - b.time);
    const nextClass = upcoming[0];
    if (!nextClass) {
        countdownEl.textContent = 'No classes';
        if (countdownNameEl) {
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
        window.dispatchEvent(new CustomEvent("attendora-update-ui"));
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
            window.dispatchEvent(new CustomEvent("attendora-update-ui"));
            showToast(`Term '${termName}' archived! Start fresh now.`);
            toggleModal(document.getElementById('settings-modal'), false);
        }
    );
}

export function renderOverviewCards() {
    const grid = document.getElementById('overview-grid');
    grid.innerHTML = '';
    const cardHTML = {
        'overview-card-attendance': `
            <div id="overview-card-attendance" class="card p-6 rounded-2xl overview-card relative overflow-hidden" draggable="true">
                <h3 class="text-xs font-bold uppercase tracking-widest mb-2" style="color: var(--text-secondary);">Attendance Score</h3>
                <div class="flex items-baseline gap-2">
                    <p id="overview-attendance" class="text-5xl font-black text-green-400">-%</p>
                    <span class="text-xs text-gray-500 font-bold uppercase">overall</span>
                </div>
                <div class="mt-6 w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div id="overview-attendance-bar" class="bg-green-400 h-full rounded-full transition-all duration-1000" style="width: 0%"></div>
                </div>
            </div>`,
        'overview-card-classes': `
            <div id="overview-card-classes" class="card p-6 rounded-2xl overview-card relative overflow-hidden" draggable="true">
                <h3 class="text-xs font-bold uppercase tracking-widest mb-2" style="color: var(--text-secondary);">Academic Load</h3>
                <div class="flex items-baseline gap-2">
                    <p id="overview-total-classes" class="text-5xl font-black text-white">0</p>
                    <span class="text-xs text-gray-500 font-bold uppercase">Lectures</span>
                </div>
                <!-- Segmented Progress Bar -->
                <div class="mt-4 w-full h-1.5 flex rounded-full overflow-hidden bg-white/5">
                    <div id="overview-present-bar" class="h-full bg-green-500 transition-all duration-1000" style="width: 0%"></div>
                    <div id="overview-absent-bar" class="h-full bg-red-500 transition-all duration-1000" style="width: 0%"></div>
                </div>
                <div class="flex justify-between mt-3 text-[10px] font-black uppercase tracking-widest">
                    <div class="flex items-center gap-1.5">
                        <span class="text-green-500">Attended: <span id="overview-present-classes" class="text-white ml-0.5">0</span></span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <span class="text-red-500">Skipped: <span id="overview-absent-classes" class="text-white ml-0.5">0</span></span>
                    </div>
                </div>
            </div>`,
        'overview-card-countdown': `
            <div id="overview-card-countdown" class="card p-6 rounded-2xl overview-card relative overflow-hidden" draggable="true">
                <h3 class="text-xs font-bold uppercase tracking-widest mb-2" style="color: var(--text-secondary);">Upcoming</h3>
                <p id="overview-countdown" class="text-4xl font-black text-cyan-400 truncate tracking-tighter">Preparing...</p>
                <div class="flex items-center gap-2 mt-6">
                    <div class="h-2 w-2 rounded-full bg-cyan-500"></div>
                    <p id="overview-countdown-classname" class="text-[11px] font-black uppercase truncate" style="color: var(--text-secondary);"></p>
                </div>
            </div>`
    };
    const requiredOrder = ['overview-card-attendance', 'overview-card-classes', 'overview-card-countdown'];

    let dashboardOrder = state.settings.dashboardOrder || [];
    dashboardOrder = dashboardOrder.filter(id => requiredOrder.includes(id));
    if (dashboardOrder.length !== requiredOrder.length) {
        dashboardOrder = requiredOrder;
    }
    state.settings.dashboardOrder = dashboardOrder;
    dashboardOrder.forEach(cardId => {
        if (cardHTML[cardId]) {
            grid.innerHTML += cardHTML[cardId];
        }
    });
}
