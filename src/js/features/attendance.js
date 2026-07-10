import { state, saveData, dateIsWithinTerm } from '../core/state.js';
import { checkAchievements } from './gamification.js';
import { showToast, toggleModal } from '../ui/ui.js';

let chartInstances = {};

export function handleAttendanceAction(classId, status, historyId = null, reason = '') {
    const today = new Date().toISOString().slice(0, 10);
    if (!dateIsWithinTerm(today)) {
            showToast("Term has ended. Attendance marking is disabled.", "error");
            return;
    }
    const classInfo = state.schedule.find(c => c.id === classId);
    let alreadyMarkedIndex = -1;
    if (historyId) {
        alreadyMarkedIndex = state.history.findIndex(entry => entry.id === historyId);
    } else {
        alreadyMarkedIndex = state.history.findIndex(entry => entry.classId === classId && entry.date === today);
    }
    if (alreadyMarkedIndex > -1) {
        state.history[alreadyMarkedIndex].status = status;
        state.history[alreadyMarkedIndex].reason = reason; 
    } else {
        state.history.push({ id: Date.now(), classId: classId, date: today, status: status, note: '', reason: reason });
    }

    checkAchievements(classInfo?.name);
    saveData();
    window.dispatchEvent(new CustomEvent('attendora-update-ui'));
}

export function openEditAttendanceModal(classId, historyId, courseName) {
    state.editingAttendance = { classId, historyId, courseName };
    const editAttendanceModal = document.getElementById('edit-attendance-modal');
    document.getElementById('edit-attendance-title').textContent = `Edit Attendance for ${courseName}`;
    const historyEntry = state.history.find(h => h.id === historyId);
    document.getElementById('absent-reason').value = historyEntry?.reason || '';
    const buttonContainer = editAttendanceModal.querySelector('.flex.justify-center');
    buttonContainer.innerHTML = `
        <button data-status="Present" data-class-id="${classId}" class="edit-attendance-action-btn attendance-btn border-green-500 text-green-500 hover:bg-green-500 hover:text-white" aria-label="Set Present">Present</button>
        <button data-status="Absent" data-class-id="${classId}" class="edit-attendance-action-btn attendance-btn border-red-500 text-red-500 hover:bg-red-500 hover:text-white" aria-label="Set Absent">Absent</button>
        <button data-status="Cancelled" data-class-id="${classId}" class="edit-attendance-action-btn attendance-btn border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white" aria-label="Set Cancelled">Cancel</button>
    `;
    toggleModal(editAttendanceModal, true);
}

export function autoMarkMissedClasses() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    const yesterdayDayName = yesterday.toLocaleString('en-us', { weekday: 'long' });
    if (!dateIsWithinTerm(yesterdayStr)) return;
    const yesterdayClasses = state.schedule.filter(c => c.day === yesterdayDayName);
    let missedCount = 0;
    yesterdayClasses.forEach(c => {
        const isMarked = state.history.some(h => h.classId === c.id && h.date === yesterdayStr);
        if (!isMarked) {
            state.history.push({
                id: Date.now(),
                classId: c.id,
                date: yesterdayStr,
                status: 'Absent',
                note: 'Automatically marked as absent.',
                reason: 'AUTOMATED' 
            });
            missedCount++;
        }
    });
    if (missedCount > 0) {
        showToast(`Automatically marked ${missedCount} missed classes from yesterday.`);
        saveData();
    }
}

export function calculateOverallAttendance() {
    const trackedHistory = state.history.filter(h => dateIsWithinTerm(h.date)); 
    const presentCount = trackedHistory.filter(h => h.status === 'Present').length;
    const absentCount = trackedHistory.filter(h => h.status === 'Absent').length;
    const total = presentCount + absentCount;
    const percentage = total === 0 ? 100 : Math.round((presentCount / total) * 100);
    return { present: presentCount, absent: absentCount, total: total, percentage: percentage };
}

export function calculateAttendanceForCourse(courseName) {
    const courseInstances = state.schedule.filter(s => s.name === courseName);
    const courseInstanceIds = courseInstances.map(i => i.id);
    const historyForCourse = state.history.filter(h => courseInstanceIds.includes(h.classId) && dateIsWithinTerm(h.date));
    const presentCount = historyForCourse.filter(h => h.status === 'Present').length;
    const absentCount = historyForCourse.filter(h => h.status === 'Absent').length;
    const cancelledCount = historyForCourse.filter(h => h.status === 'Cancelled').length;
    const totalTracked = presentCount + absentCount;
    const percentage = totalTracked === 0 ? 100 : Math.round((presentCount / totalTracked) * 100);
    let wasBelow70 = false;
    for(let i=1; i < historyForCourse.length; i++) {
        const pastSlice = historyForCourse.slice(0, i);
        const pastPresent = pastSlice.filter(h => h.status === 'Present').length;
        const pastAbsent = pastSlice.filter(h => h.status === 'Absent').length;
        if((pastPresent + pastAbsent) > 0 && (pastPresent / (pastPresent + pastAbsent)) < 0.70) {
            wasBelow70 = true;
            break;
        }
    }
    return { present: presentCount, absent: absentCount, cancelled: cancelledCount, total: totalTracked, percentage, wasBelow70 };
}

export function calculateStreak(courseName) {
    const courseInstances = state.schedule.filter(s => s.name === courseName);
    const courseInstanceIds = courseInstances.map(i => i.id);
    const historyForCourse = state.history.filter(h => courseInstanceIds.includes(h.classId) && dateIsWithinTerm(h.date))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    for (const record of historyForCourse) {
        if (record.status === 'Present') streak++;
        else if (record.status === 'Absent') break;
    }
    return streak;
}

export function renderReports() {
    const filterType = document.getElementById('reports-filter').value;
    const filteredHistory = getFilteredHistory(filterType);
    const container = document.getElementById('subject-chart-container');
    container.innerHTML = '';
        Object.values(chartInstances).forEach(chart => {
        if(chart && typeof chart.destroy === 'function') chart.destroy();
        });
    chartInstances = {};
    const uniqueCourses = [...new Set(state.schedule.map(item => item.name))];
    if(uniqueCourses.length === 0) {
        container.innerHTML = `<p class="col-span-full text-center" style="color: var(--text-secondary);">No courses to generate a report for. Add courses via 'My Schedule'.</p>`;
        const trendsCtx = document.getElementById('trends-chart').getContext('2d');
        if(chartInstances.trends) chartInstances.trends.destroy();
        trendsCtx.clearRect(0, 0, trendsCtx.canvas.width, trendsCtx.canvas.height);
        return;
    }
    const gridTextColor = getComputedStyle(document.body).getPropertyValue('--text-secondary');
    const chartBorderColor = getComputedStyle(document.body).getPropertyValue('--background-color');
    const calculateStatsFromHistory = (courseName) => {
            const courseInstances = state.schedule.filter(s => s.name === courseName);
            const courseInstanceIds = courseInstances.map(i => i.id);
            const historyForCourse = filteredHistory.filter(h => courseInstanceIds.includes(h.classId));
            const presentCount = historyForCourse.filter(h => h.status === 'Present').length;
            const absentCount = historyForCourse.filter(h => h.status === 'Absent').length;
            const cancelledCount = historyForCourse.filter(h => h.status === 'Cancelled').length;
            const totalTracked = presentCount + absentCount;
            const percentage = totalTracked === 0 ? 100 : Math.round((presentCount / totalTracked) * 100);
            return { present: presentCount, absent: absentCount, cancelled: cancelledCount, total: totalTracked, percentage };
    };
    uniqueCourses.forEach(courseName => {
        const stats = calculateStatsFromHistory(courseName);
        const chartWrapper = document.createElement('div');
        chartWrapper.className = 'card rounded-xl p-4 flex flex-col items-center no-hover';
        chartWrapper.innerHTML = `
            <h4 class="text-lg font-bold mb-2">${courseName}</h4>
            <canvas id="chart-${courseName.replace(/\s+/g, '')}"></canvas>
        `;
        container.appendChild(chartWrapper);
        const ctx = document.getElementById(`chart-${courseName.replace(/\s+/g, '')}`).getContext('2d');
        chartInstances[courseName] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Present', 'Absent', 'Cancelled'],
                datasets: [{
                    label: 'Attendance',
                    data: [stats.present, stats.absent, stats.cancelled],
                    backgroundColor: ['#22c55e', '#ef4444', '#6b7280'],
                    borderColor: chartBorderColor,
                    borderWidth: 4,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: gridTextColor }
                    },
                    title: { display: true, text: `${stats.percentage}% Overall`, color: gridTextColor }
                }
            }
        });
    });
    const trendsCtx = document.getElementById('trends-chart').getContext('2d');
    const historyByDate = filteredHistory.reduce((acc, h) => {
        if (h.status === 'Present' || h.status === 'Absent') {
            (acc[h.date] = acc[h.date] || []).push(h.status);
        }
        return acc;
    }, {});
    const sortedDates = Object.keys(historyByDate).sort((a,b) => new Date(a) - new Date(b));
    const trendData = [];
    let p = 0, a = 0;
    sortedDates.forEach(date => {
        const presentToday = historyByDate[date].filter(s => s === 'Present').length;
        const absentToday = historyByDate[date].filter(s => s === 'Absent').length;
        p += presentToday;
        a += absentToday;
        trendData.push({ x: date, y: (p + a) === 0 ? 100 : Math.round((p / (p + a)) * 100) });
    });
    if(chartInstances.trends) chartInstances.trends.destroy();
    chartInstances.trends = new Chart(trendsCtx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Overall Attendance %',
                data: trendData,
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color-start'),
                tension: 0.1
            }]
        },
        options: {
            scales: {
                x: { 
                    type: 'time', 
                    time: { unit: filterType === 'week' ? 'day' : (filterType === 'month' ? 'week' : 'month') }, 
                    grid: { color: gridTextColor+'30' }, 
                    ticks: { color: gridTextColor } 
                },
                y: { beginAtZero: true, max: 100, min: 0, grid: { color: gridTextColor+'30' }, ticks: { color: gridTextColor } }
            },
            plugins: { legend: { labels: { color: gridTextColor } } }
        }
    });
}

function getFilteredHistory(filterType) {
    const now = new Date();
    let filterDate = null;
    if (filterType === 'week') {
        filterDate = new Date();
        filterDate.setDate(now.getDate() - 7);
    } else if (filterType === 'month') {
        filterDate = new Date();
        filterDate.setDate(now.getDate() - 30);
    } else if (filterType === 'term') {
        filterDate = new Date(state.settings.termStartDate + 'T00:00:00');
    }
    const filterDateStr = filterDate ? filterDate.toISOString().slice(0, 10) : null;
    const history = state.history.filter(h => {
        const hDate = new Date(h.date + 'T00:00:00');
        const endDate = new Date(state.settings.termEndDate + 'T23:59:59');
        if (filterType === 'cumulative') return true;
        if (filterDateStr && h.date < filterDateStr) return false;
        if (hDate > endDate) return false;
        return true;
    });
    return history;
}

export function renderCourses() {
    const coursesGrid = document.getElementById('courses-grid');
    const uniqueCourses = [...new Set(state.schedule.map(item => item.name))];
    coursesGrid.innerHTML = '';
    if (uniqueCourses.length > 0) {
        uniqueCourses.forEach(courseName => {
            const stats = calculateAttendanceForCourse(courseName);
            const streak = calculateStreak(courseName);
            let percentageColorClass = 'text-red-500';
            if (stats.percentage >= 85) percentageColorClass = 'text-green-400';
            else if (stats.percentage >= 75) percentageColorClass = 'text-yellow-400';
            else percentageColorClass = 'text-red-400';
            const courseCard = document.createElement('button');
            courseCard.className = 'card course-card-clickable p-6 rounded-xl text-left';
            courseCard.dataset.courseName = courseName;
            courseCard.dataset.searchContent = courseName.toLowerCase();
            courseCard.setAttribute('role', 'button'); 
            courseCard.setAttribute('aria-label', `View details for course ${courseName}`); 
            courseCard.innerHTML = `
                <div class="flex justify-between items-start">
                    <h3 class="text-xl font-bold pointer-events-none">${courseName}</h3>
                    ${streak > 0 ? `<div class="text-lg font-bold text-orange-400 pointer-events-none">${streak} 🔥</div>` : ''}
                </div>
                <p class="mb-4 pointer-events-none" style="color: var(--text-secondary);">Click to see details</p>
                <div class="w-full bg-gray-700/30 rounded-full h-2.5 pointer-events-none">
                    <div class="h-2.5 rounded-full" style="width: ${stats.percentage}%; background-color: var(--primary-color-start);"></div>
                </div>
                <p class="text-right font-bold mt-2 pointer-events-none ${percentageColorClass}">${stats.percentage}% Attendance</p>
                `;
                coursesGrid.appendChild(courseCard);
        });
    } else {
        coursesGrid.innerHTML = `
            <div class="col-span-full text-center py-20 px-6 card border-dashed border-2 border-white/5 no-hover rounded-3xl">
                <div class="mb-6 inline-flex p-5 rounded-full bg-blue-500/10">
                    <svg class="h-12 w-12 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <h3 class="text-2xl font-bold text-white mb-2">Ready to start your term?</h3>
                <p class="text-gray-400 mb-8 max-w-md mx-auto">Your course attendance analytics will appear here once you set up your schedule.</p>
                <button onclick="window.location.hash='#schedule'" class="px-8 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold text-white">
                    Go to My Schedule
                </button>
            </div>`;
    }
}
