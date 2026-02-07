import { state, saveData, dateIsWithinTerm } from './state.js';
import { showToast, toggleModal } from './ui.js';
import { calculateOverallAttendance, calculateAttendanceForCourse } from './attendance.js';

// Local copy to avoid circular dependency with academics.js
const calculateGpaLocal = () => {
    const totalPoints = state.gpaCourses.reduce((acc, course) => acc + (course.grade * course.credits), 0);
    const totalCredits = state.gpaCourses.reduce((acc, course) => acc + course.credits, 0);
    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    return { totalCredits, gpa };
};

export const ALL_ACHIEVEMENTS = {
    'firstStep': { title: 'First Class', desc: 'Add your first class.', icon: '👟', goal: 1, type: 'easy', id: 'firstStep' },
    'fullyScheduled': { title: 'Full Schedule', desc: 'Add 10 or more classes.', icon: '🗓️', goal: 10, type: 'easy', id: 'fullyScheduled' },
    'firstPomodoro': { title: 'First Focus', desc: 'Complete one full Pomodoro session.', icon: '🍅', goal: 1, type: 'easy', id: 'firstPomodoro' },
    'gpaStarter': { title: 'GPA Starter', desc: 'Add your first 3 courses to the GPA Calculator.', icon: '📈', goal: 3, type: 'easy', id: 'gpaStarter' },
    'threeStreak': { title: 'Three Streak', desc: 'Attend 3 consecutive classes for any subject.', icon: '🔥', goal: 3, type: 'easy', id: 'threeStreak' },
    'dedicatedWeek': { title: 'Dedicated Week', desc: 'Mark attendance 7 days total.', icon: '🗓️', goal: 7, type: 'medium', id: 'dedicatedWeek' },
    'tenStreak': { title: 'Ten Streak', desc: 'Attend 10 consecutive classes for any subject.', icon: '⚡', goal: 10, type: 'medium', id: 'tenStreak' },
    'marathonRunner': { title: 'Marathon Runner', desc: 'Complete 10 Pomodoro sessions.', icon: '🏃', goal: 10, type: 'medium', id: 'marathonRunner' },
    'assignmentMaster': { title: 'Assignment Master', desc: 'Track 10 upcoming assignments.', icon: '📝', goal: 10, type: 'medium', id: 'assignmentMaster' },
    'labRat': { title: 'Lab Rat', desc: 'Achieve 100% attendance in a designated Lab course for 5 classes.', icon: '🔬', goal: 5, type: 'medium', id: 'labRat' },
    'wiseBunker': { title: 'Wise Bunker', desc: 'Use the Bunk Planner successfully 5 times (stay above goal).', icon: '🧠', goal: 5, type: 'medium', id: 'wiseBunker' },
    'dedicatedMonth': { title: 'Dedicated Month', desc: 'Mark attendance 30 days total.', icon: '🎯', goal: 30, type: 'hard', id: 'dedicatedMonth' },
    'masterStreak': { title: 'Master Streak', desc: 'Attend 25 consecutive classes for any subject.', icon: '🏆', goal: 25, type: 'hard', id: 'masterStreak' },
    'focusChampion': { title: 'Focus Champion', desc: 'Complete 50 Pomodoro sessions.', icon: '🥇', goal: 50, type: 'hard', id: 'focusChampion' },
    'attendanceGuru': { title: 'Attendance Guru', desc: 'Maintain 95%+ overall attendance over 50 tracked classes.', icon: '💯', goal: 50, type: 'hard', id: 'attendanceGuru' },
    'comebackKing': { title: 'Comeback King', desc: 'Raise a subject from below 70% to above 85% attendance.', icon: '👑', goal: 1, type: 'hard', id: 'comebackKing' },
    'topPerformer': { title: 'Top Performer', desc: 'Achieve a calculated GPA of 9.5 or higher.', icon: '💎', goal: 9.5, type: 'hard', id: 'topPerformer' },
    'creditCollector': { title: 'Credit Collector', desc: 'Log courses totaling 40 credits or more.', icon: '🌟', goal: 40, type: 'hard', id: 'creditCollector' },
    'plannerPro': { title: 'Planner Pro', desc: 'Log 25 Assignments (Quizzes, Exams, Projects).', icon: '📑', goal: 25, type: 'medium', id: 'plannerPro' },
    'semesterArchivist': { title: 'Semester Archivist', desc: 'Archive a total of 3 complete semesters.', icon: '💾', goal: 3, type: 'hard', id: 'semesterArchivist' },
};

export const checkAchievements = (courseName = null) => {
    let newAchievement = false;
    const attemptUnlock = (id, progressValue, checkFn) => {
        if (id === 'firstPomodoro' || id === 'marathonRunner' || id === 'focusChampion') return;
        const goal = ALL_ACHIEVEMENTS[id].goal;
        if (!state.achievements[id]?.unlocked) {
            if (checkFn(progressValue)) {
                state.achievements[id] = { unlocked: true, date: new Date(), progress: progressValue };
                showToast(`🏆 Achievement Unlocked: ${ALL_ACHIEVEMENTS[id].title}!`);
                newAchievement = true;
            } else {
                const currentProgress = state.achievements[id]?.progress || 0;
                let newProgress = progressValue;
                if (id === 'topPerformer') {
                } else {
                    newProgress = Math.min(progressValue, goal);
                }
                state.achievements[id] = { 
                    ...(state.achievements[id] || { unlocked: false, progress: 0 }), 
                    progress: newProgress > currentProgress ? newProgress : currentProgress
                };
            }
        }
    };
    const totalDaysMarked = new Set(state.history.map(h => h.date)).size;
    const allCourseNames = [...new Set(state.schedule.map(c => c.name))];
    const maxStreak = Math.max(0, ...allCourseNames.map(calculateStreak));
    const { totalCredits, gpa } = calculateGpaLocal();
    const totalClasses = state.history.filter(h => h.status === 'Present' || h.status === 'Absent').length;
    const totalClassesAttended = state.history.filter(h => h.status === 'Present').length;
    const overallAttendancePercentage = totalClasses > 0 ? (totalClassesAttended / totalClasses) * 100 : 100;
    attemptUnlock('firstStep', state.schedule.length, (val) => val >= ALL_ACHIEVEMENTS.firstStep.goal);
    attemptUnlock('fullyScheduled', state.schedule.length, (val) => val >= ALL_ACHIEVEMENTS.fullyScheduled.goal);
    attemptUnlock('gpaStarter', state.gpaCourses.length, (val) => val >= ALL_ACHIEVEMENTS.gpaStarter.goal);
    attemptUnlock('dedicatedWeek', totalDaysMarked, (val) => val >= ALL_ACHIEVEMENTS.dedicatedWeek.goal);
    attemptUnlock('dedicatedMonth', totalDaysMarked, (val) => val >= ALL_ACHIEVEMENTS.dedicatedMonth.goal);
    attemptUnlock('threeStreak', maxStreak, (val) => val >= ALL_ACHIEVEMENTS.threeStreak.goal);
    attemptUnlock('tenStreak', maxStreak, (val) => val >= ALL_ACHIEVEMENTS.tenStreak.goal);
    attemptUnlock('masterStreak', maxStreak, (val) => val >= ALL_ACHIEVEMENTS.masterStreak.goal);
    if (totalClasses >= ALL_ACHIEVEMENTS.attendanceGuru.goal) {
        attemptUnlock('attendanceGuru', overallAttendancePercentage, (val) => val >= 95);
    }
    if (courseName) {
        const stats = calculateAttendanceForCourse(courseName);
        if(stats.percentage >= 85 && stats.wasBelow70) { 
            attemptUnlock('comebackKing', 1, (val) => val === 1);
        }
    }
    attemptUnlock('assignmentMaster', state.assignments.length, (val) => val >= ALL_ACHIEVEMENTS.assignmentMaster.goal);
    attemptUnlock('plannerPro', state.assignments.length, (val) => val >= ALL_ACHIEVEMENTS.plannerPro.goal);
    attemptUnlock('creditCollector', totalCredits, (val) => val >= ALL_ACHIEVEMENTS.creditCollector.goal);
    attemptUnlock('topPerformer', gpa, (val) => val >= ALL_ACHIEVEMENTS.topPerformer.goal);
    attemptUnlock('semesterArchivist', state.archivedTerms.length, (val) => val >= ALL_ACHIEVEMENTS.semesterArchivist.goal);
    if (newAchievement) {
        saveData();
    }
};

export const renderAchievements = () => {
    const achievementsGrid = document.getElementById('achievements-grid');
    if (!achievementsGrid) return;
    achievementsGrid.innerHTML = '';
    for (const id in ALL_ACHIEVEMENTS) {
        const achievement = ALL_ACHIEVEMENTS[id];
        if (id === 'firstPomodoro' || id === 'marathonRunner' || id === 'focusChampion') continue;
        const data = state.achievements[id] || { unlocked: false, progress: 0 };
        let goalDisplay = achievement.goal;
        let progressValue = data.progress;
        let progressDisplay = `${data.progress || 0}/${achievement.goal}`;
        const { percentage: overallAttendancePercentage } = calculateOverallAttendance(); 
        if (id === 'topPerformer') {
            goalDisplay = `${achievement.goal.toFixed(1)} GPA`;
            progressDisplay = `Current GPA: ${data.progress.toFixed(2)}`;
            progressValue = data.unlocked ? 100 : Math.min(100, (data.progress / 10) * 100); 
        } else if (id === 'creditCollector') {
             goalDisplay = `${achievement.goal} Credits`;
             progressDisplay = `Collected: ${data.progress || 0}/${achievement.goal} Credits`;
             progressValue = data.unlocked ? 100 : Math.min(100, (data.progress / achievement.goal) * 100);
        } else if (id === 'comebackKing') {
             goalDisplay = 'Recovery Complete';
             progressDisplay = data.unlocked ? 'Success!' : 'In Progress...';
             progressValue = data.unlocked ? 100 : 0;
        } else if (id === 'attendanceGuru') {
             progressDisplay = `Current: ${overallAttendancePercentage.toFixed(1)}%`;
             progressValue = data.unlocked ? 100 : Math.min(100, (overallAttendancePercentage / 95) * 100); 
             if (progressValue > 100) progressValue = 100;
        } else {
            progressValue = data.unlocked ? 100 : Math.min(100, (data.progress / achievement.goal) * 100);
            progressDisplay = `Progress: ${data.progress || 0}/${achievement.goal}`;
        }
        const badge = document.createElement('div');
        badge.className = `card p-4 text-center achievement-badge ${!data.unlocked ? 'locked' : ''} ${achievement.type === 'hard' ? 'border-yellow-500/50' : achievement.type === 'medium' ? 'border-blue-500/50' : 'border-green-500/50'}`;
        badge.innerHTML = `
            <div class="text-5xl mb-2">${achievement.icon}</div>
            <h3 class="font-bold">${achievement.title}</h3>
            <p class="text-sm h-10" style="color: var(--text-secondary);">${achievement.desc}</p>
            ${data.unlocked ? `<p class="text-xs text-green-500 mt-2">Unlocked on ${new Date(data.date).toLocaleDateString()}</p>` : `
            <div class="w-full bg-gray-700/50 rounded-full h-2.5 mt-2">
                <div class="bg-yellow-500 h-2.5 rounded-full" style="width: ${progressValue}%"></div>
            </div>
            <p class="text-xs mt-1" style="color: var(--text-secondary);">${progressDisplay}</p>
            `}
        `;
        achievementsGrid.appendChild(badge);
    }
};

const calculateStreak = (courseName) => {
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
};

export const generateSemesterWrapped = () => {
    const semesterWrappedModal = document.getElementById('semester-wrapped-modal');
    const container = document.getElementById('wrapped-content');
    const termHistory = state.history.filter(h => dateIsWithinTerm(h.date));
    if (termHistory.length < 5) {
        container.innerHTML = `<p class="text-center" style="color: var(--text-secondary);">Not enough data within the current term for a summary yet. Keep tracking your attendance!</p>`;
        toggleModal(semesterWrappedModal, true);
        return;
    }
    const presentCount = termHistory.filter(h => h.status === 'Present').length;
    const absentCount = termHistory.filter(h => h.status === 'Absent').length;
    const total = presentCount + absentCount;
    const overallPercentage = total === 0 ? 100 : Math.round((presentCount / total) * 100);
    const courseStats = [...new Set(state.schedule.map(c => c.name))].map(name => ({
        name,
        stats: calculateAttendanceForCourse(name),
        streak: calculateStreak(name)
    }));
    const validCourses = courseStats.filter(c => c.stats.total > 0);
    const bestCourse = validCourses.reduce((best, current) => current.stats.percentage > best.stats.percentage ? current : best, {stats: {percentage: -1}, name: 'N/A'});
    const worstCourse = validCourses.reduce((worst, current) => current.stats.percentage < worst.stats.percentage ? current : worst, {stats: {percentage: 101}, name: 'N/A'});
    const longestStreak = Math.max(0, ...validCourses.map(c => c.streak));
    const unlockedAchievements = Object.values(state.achievements).filter(a => a.unlocked).length;
    const { gpa } = calculateGpaLocal();
    container.innerHTML = `
        <div class="p-3 bg-white/5 rounded-lg"><strong>Current Term:</strong> <span class="font-bold text-white">${new Date(state.settings.termStartDate + 'T00:00:00').toLocaleDateString()} - ${new Date(state.settings.termEndDate + 'T00:00:00').toLocaleDateString()}</span></div>
        <div class="p-3 bg-white/5 rounded-lg"><strong>Overall Attendance:</strong> <span class="font-bold text-green-400">${overallPercentage}%</span></div>
        <div class="p-3 bg-white/5 rounded-lg"><strong>Calculated GPA:</strong> <span class="font-bold text-yellow-400">${gpa.toFixed(2)}</span></div>
        <div class="p-3 bg-white/5 rounded-lg"><strong>Total Classes Attended:</strong> <span class="font-bold">${presentCount}</span></div>
        <div class="p-3 bg-white/5 rounded-lg"><strong>Total Classes Missed:</strong> <span class="font-bold text-red-400">${absentCount}</span></div>
        <div class="p-3 bg-white/5 rounded-lg"><strong>Most Attended Course:</strong> <span class="font-bold text-cyan-400">${bestCourse.name} (${bestCourse.stats.percentage}%)</span></div>
        <div class="p-3 bg-white/5 rounded-lg"><strong>Needs Improvement:</strong> <span class="font-bold text-yellow-400">${worstCourse.name} (${worstCourse.stats.percentage}%)</span></div>
        <div class="p-3 bg-white/5 rounded-lg"><strong>Longest Attendance Streak:</strong> <span class="font-bold text-orange-400">${longestStreak} classes 🔥</span></div>
        <div class="p-3 bg-white/5 rounded-lg"><strong>Achievements Unlocked:</strong> <span class="font-bold text-yellow-300">${unlockedAchievements} 🏆</span></div>
    `;
    toggleModal(semesterWrappedModal, true);
};

export const shareSemesterWrapped = () => {
    const content = document.getElementById('wrapped-content').innerText;
    const summary = `My Attendora Semester Wrapped:\n\n${content.replace(/:\s/g, ': ')}\n\nTracked with #Attendora`;
    if (navigator.share) {
        navigator.share({
            title: 'My Semester Wrapped!',
            text: summary,
        }).catch(err => console.error("Share failed:", err));
    } else {
        navigator.clipboard.writeText(summary).then(() => {
            showToast('Summary copied to clipboard!');
        }).catch(err => {
            showToast('Failed to copy summary.', 'error');
        });
    }
};
