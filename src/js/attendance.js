import { state, saveData, dateIsWithinTerm } from './state.js';
import { updateAllViews } from './main.js';
import { checkAchievements } from './gamification.js';
import { showToast, toggleModal } from './ui.js';

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
    updateAllViews();
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
            coursesGrid.innerHTML = `<div class="col-span-full text-center py-16">
            <svg class="mx-auto h-24 w-24 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
            <h3 class="mt-4 text-xl font-semibold text-white">No Courses Found</h3>
            <p class="mt-1" style="color: var(--text-secondary);">You haven't added any courses yet. Go to 'My Schedule' to add a class.</p>
        </div>`;
    }
}