import { state, saveData, dateIsWithinTerm } from './state.js';
import { updateAllViews } from './main.js';
import { checkAchievements } from './gamification.js';
import { showConfirmationModal, showToast, toggleModal } from './ui.js';
import { calculateAttendanceForCourse } from './attendance.js';

export function renderAssignments() {
    const assignmentsList = document.getElementById('assignments-list');
    const upcomingAssignmentsList = document.getElementById('upcoming-assignments-list');
    assignmentsList.innerHTML = '';
    upcomingAssignmentsList.innerHTML = '';
    if (state.schedule.length === 0) {
        const emptyState = `
            <div class="text-center py-16 card rounded-xl p-6 no-hover">
                <svg class="mx-auto h-24 w-24 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 6.75 6h.75c.621 0 1.125.504 1.125 1.125v3.026a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-1.5a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 0 0 18 19.5h1.5a2.25 2.25 0 002.25-2.25V6.75Z" />
                </svg>
                <h3 class="mt-4 text-xl font-semibold text-white">No assignments yet</h3>
                <p class="mt-1 text-gray-400">Please add a course from 'My Schedule' to start adding assignments.</p>
            </div>`;
        assignmentsList.innerHTML = emptyState;
        upcomingAssignmentsList.innerHTML = `<li class="text-center py-4" style="color: var(--text-secondary);">No courses available.</li>`;
        return;
    }
    const sortedAssignments = [...state.assignments].sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
    const now = new Date();
    if (sortedAssignments.length > 0) {
            sortedAssignments.forEach(a => {
            const dueDate = new Date(a.dueDate + 'T23:59:59'); 
            const isPast = dueDate < now;
            const daysRemaining = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
            let colorClass = 'text-green-500';
            if (daysRemaining <= 3) colorClass = 'text-yellow-500';
            if (daysRemaining <= 1) colorClass = 'text-red-500';
            const itemHTML = `
                <div class="assignment-item p-4 bg-white/5 rounded-lg flex flex-col sm:flex-row justify-between items-start gap-4 ${isPast ? 'opacity-60' : ''}" data-search-content="${a.title.toLowerCase()} ${a.course.toLowerCase()}">
                    <div>
                        <span class="px-2 py-1 text-xs font-semibold rounded-full ${ a.type === 'Exam' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400' }">${a.type}</span>
                        <h4 class="text-lg font-bold mt-2">${a.title}</h4>
                        <p class="text-sm" style="color: var(--text-secondary);">${a.course} - Due: ${new Date(a.dueDate + 'T00:00:00').toLocaleDateString()}</p>
                    </div>
                    <div class="flex items-center gap-4 flex-shrink-0">
                        ${!isPast ? `<span class="font-bold ${colorClass}">${daysRemaining}d left</span>` : '<span class="font-bold" style="color: var(--text-secondary);">Past Due</span>'}
                        <div class="flex gap-2">
                            <button class="edit-assignment-btn p-2" role="button" aria-label="Edit assignment ${a.title}" style="color: var(--text-secondary);" data-assignment-id="${a.id}"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 pointer-events-none" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg></button>
                            <button class="delete-assignment-btn p-2" role="button" aria-label="Delete assignment ${a.title}" style="color: var(--text-secondary);" data-assignment-id="${a.id}"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 pointer-events-none" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button>
                        </div>
                    </div>
                </div>
            `;
            assignmentsList.innerHTML += itemHTML;
            if (!isPast) {
                    upcomingAssignmentsList.innerHTML += `
                    <li class="flex justify-between items-center p-2 rounded-lg">
                        <div>
                            <span class="font-semibold">${a.title}</span>
                            <span class="text-sm" style="color: var(--text-secondary);">(${a.course})</span>
                        </div>
                        <span class="font-bold ${colorClass}">${daysRemaining}d left</span>
                    </li>`;
            }
        });
    } else {
        assignmentsList.innerHTML = `<p class="text-center py-8" style="color: var(--text-secondary);">No assignments or exams added yet.</p>`;
    }
    if (upcomingAssignmentsList.innerHTML === '') {
        upcomingAssignmentsList.innerHTML = `<li class="text-center py-4" style="color: var(--text-secondary);">No upcoming deadlines. You're all caught up!</li>`;
    }
}

export function handleAssignmentFormSubmit(e) {
    e.preventDefault();
    const editingId = document.getElementById('editing-assignment-id').value;
    const assignmentData = {
        title: document.getElementById('assignment-title').value,
        course: document.getElementById('assignment-course').value,
        type: document.getElementById('assignment-type').value,
        dueDate: document.getElementById('assignment-due-date').value
    };
    if (editingId) {
        const index = state.assignments.findIndex(a => a.id === editingId);
        if (index > -1) state.assignments[index] = { ...state.assignments[index], ...assignmentData };
    } else {
        state.assignments.push({ id: `asg-${Date.now()}`, ...assignmentData });
    }
    saveData();
    updateAllViews();
    toggleModal(document.getElementById('assignment-modal'), false); 
}

export function handleDeleteAssignment(assignmentId) {
    const assignment = state.assignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    const title = `Delete '${assignment.title}'?`;
    const message = `This assignment will be permanently removed.`;
    showConfirmationModal(title, message, () => {
        state.assignments = state.assignments.filter(a => a.id !== assignmentId);
        saveData();
        updateAllViews();
        showToast('Assignment deleted.');
    });
}

export function handleGpaFormSubmit(e) {
    e.preventDefault();
    const editingId = document.getElementById('editing-gpa-id').value;
    const estimatedPercent = document.getElementById('gpa-estimated-percent').value;
    const gpaData = {
        name: document.getElementById('gpa-course-name').value,
        credits: parseFloat(document.getElementById('gpa-credits').value),
        grade: parseInt(document.getElementById('gpa-grade').value), 
        estimatedPercent: estimatedPercent ? parseInt(estimatedPercent) : null, 
        date: new Date().toISOString().slice(0,10) 
    };
    if (editingId) {
        const index = state.gpaCourses.findIndex(c => c.id === editingId);
        if (index > -1) {
            gpaData.date = state.gpaCourses[index].date;
            state.gpaCourses[index] = { ...state.gpaCourses[index], ...gpaData };
        }
    } else {
        state.gpaCourses.push({ id: `gpa-${Date.now()}`, ...gpaData });
    }
    checkAchievements(); 
    saveData();
    renderGpaCalculator();
    toggleModal(document.getElementById('gpa-modal'), false); 
}

export function handleDeleteGpaCourse(gpaId) {
    const course = state.gpaCourses.find(c => c.id === gpaId);
    if (!course) return;
    const title = `Delete '${course.name}'?`;
    const message = `This GPA entry will be permanently removed.`;
    showConfirmationModal(title, message, () => {
        state.gpaCourses = state.gpaCourses.filter(c => c.id !== gpaId);
        saveData();
        renderGpaCalculator();
        showToast('GPA entry deleted.');
    });
}

export function renderGpaCalculator() {
    const tbody = document.getElementById('gpa-courses-tbody');
    tbody.innerHTML = '';
    if (state.gpaCourses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-8" style="color: var(--text-secondary);">
            <svg class="mx-auto h-24 w-24 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
            <h3 class="mt-4 text-xl font-semibold text-white">No grades added yet</h3>
            <p class="mt-1">Add courses to start calculating your GPA.</p>
        </td></tr>`;
    } else {
        state.gpaCourses.forEach(course => {
            const finalGradeDisplay = course.grade > 0 ? course.grade : 'F';
            const estimatedDisplay = course.estimatedPercent !== null ? `<br><span class="text-xs text-yellow-400">Est: ${course.estimatedPercent}%</span>` : '';
            const tr = document.createElement('tr');
            tr.className = 'border-b border-white/5';
            tr.dataset.searchContent = course.name.toLowerCase();
            tr.innerHTML = `
                <td class="p-4 font-semibold">${course.name}</td>
                <td class="p-4 text-center">${course.credits}</td>
                <td class="p-4 text-center">
                    ${finalGradeDisplay}
                    ${estimatedDisplay}
                </td>
                <td class="p-4 text-center">
                    <button class="edit-gpa-btn p-2" data-gpa-id="${course.id}" title="Edit" role="button" aria-label="Edit GPA entry for ${course.name}" style="color: var(--text-secondary);"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 pointer-events-none" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg></button>
                    <button class="delete-gpa-btn p-2 text-red-400" data-gpa-id="${course.id}" title="Delete" role="button" aria-label="Delete GPA entry for ${course.name}"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 pointer-events-none" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    const { totalCredits, gpa } = calculateGpa();
    document.getElementById('gpa-total-credits').textContent = totalCredits;
    document.getElementById('gpa-current-gpa').textContent = gpa.toFixed(2);
    document.getElementById('gpa-total-courses').textContent = state.gpaCourses.length;
    checkAchievements(); 
}

export function calculateGpa() {
    const totalPoints = state.gpaCourses.reduce((acc, course) => acc + (course.grade * course.credits), 0);
    const totalCredits = state.gpaCourses.reduce((acc, course) => acc + course.credits, 0);
    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    return { totalCredits, gpa };
}

export function openAssignmentModal(assignmentId = null) {
    const form = document.getElementById('assignment-form');
    form.reset();
    document.getElementById('editing-assignment-id').value = '';
    const courseSelect = document.getElementById('assignment-course');
    const uniqueCourses = [...new Set(state.schedule.map(item => item.name))];
    courseSelect.innerHTML = uniqueCourses.map(name => `<option value="${name}">${name}</option>`).join('');
    if (assignmentId) {
        const assignment = state.assignments.find(a => a.id === assignmentId);
        if (assignment) {
            document.getElementById('assignment-modal-title').textContent = 'Edit Assignment';
            document.getElementById('editing-assignment-id').value = assignment.id;
            document.getElementById('assignment-title').value = assignment.title;
            document.getElementById('assignment-course').value = assignment.course;
            document.getElementById('assignment-type').value = assignment.type;
            document.getElementById('assignment-due-date').value = assignment.dueDate;
        }
    } else {
        document.getElementById('assignment-modal-title').textContent = 'Add New Assignment';
    }
    toggleModal(document.getElementById('assignment-modal'), true);
}

export function openGpaModal(gpaId = null) {
    const form = document.getElementById('gpa-form');
    form.reset();
    document.getElementById('editing-gpa-id').value = '';
    const courseNameInput = document.getElementById('gpa-course-name');
    const estimatedPercentInput = document.getElementById('gpa-estimated-percent');
    if (gpaId) {
        const course = state.gpaCourses.find(c => c.id === gpaId);
        if (course) {
            document.getElementById('gpa-modal-title').textContent = 'Edit GPA Entry';
            document.getElementById('editing-gpa-id').value = course.id;
            courseNameInput.value = course.name;
            document.getElementById('gpa-credits').value = course.credits;
            document.getElementById('gpa-grade').value = course.grade;
            estimatedPercentInput.value = course.estimatedPercent || ''; 
        }
    } else {
            document.getElementById('gpa-modal-title').textContent = 'Add Course for GPA';
    }
    toggleModal(document.getElementById('gpa-modal'), true);
}

export function openNoteModal(historyId) {
    const historyEntry = state.history.find(h => h.id === historyId);
    if (!historyEntry) return;
    document.getElementById('note-history-id').value = historyId;
    document.getElementById('note-textarea').value = historyEntry.note || '';
    toggleModal(document.getElementById('notes-modal'), true);
}

export function handleNoteSubmit(e) {
    e.preventDefault();
    const historyId = parseInt(document.getElementById('note-history-id').value);
    const noteText = document.getElementById('note-textarea').value;
    const historyIndex = state.history.findIndex(h => h.id === historyId);
    if (historyIndex > -1) {
        state.history[historyIndex].note = noteText;
        saveData();
        toggleModal(document.getElementById('notes-modal'), false); 
        const courseDetailsTitle = document.getElementById('course-details-title').textContent;
        const courseDetailsModal = document.getElementById('course-details-modal');
        if (!courseDetailsModal.classList.contains('opacity-0')) {
            showCourseDetails(courseDetailsTitle); 
        }
    }
}

export function showCourseDetails(courseName) {
    document.getElementById('course-details-title').textContent = courseName;
    const goalInput = document.getElementById('attendance-goal');
    const whatIfInput = document.getElementById('what-if-input');
    const whatIfOutput = document.getElementById('what-if-output');
    whatIfInput.value = 0;
    whatIfOutput.textContent = '';
    const updateDetails = () => {
        const goal = parseInt(goalInput.value) || 75;
        const stats = calculateAttendanceForCourse(courseName); 
        let bunksAvailableText = '';
        if (stats.percentage < goal) {
                const needed = Math.ceil(( (goal/100) * stats.absent - (1 - (goal/100)) * stats.present) / (1 - (goal/100)) );
                bunksAvailableText = `<p style="color: var(--text-secondary);">Need to attend</p><p class="text-4xl font-bold text-yellow-400">${needed > 0 ? needed : 0}</p><p style="color: var(--text-secondary);">more classes to reach ${goal}%.</p>`;
        } else {
            const bunksAvailable = Math.floor( (stats.present - (goal/100) * stats.total) / (goal/100) );
            bunksAvailableText = `<p style="color: var(--text-secondary);">You can miss</p><p class="text-4xl font-bold text-cyan-400">${bunksAvailable}</p><p style="color: var(--text-secondary);">more classes and stay above ${goal}%.</p>`;
        }
        document.getElementById('bunk-planner-output').innerHTML = bunksAvailableText;
        const logContainer = document.getElementById('course-log-container');
        logContainer.innerHTML = ''; 
        const courseInstances = state.schedule.filter(s => s.name === courseName);
        const courseInstanceIds = courseInstances.map(i => i.id);
        const historyForCourse = state.history.filter(h => courseInstanceIds.includes(h.classId) && dateIsWithinTerm(h.date)).sort((a,b) => new Date(b.date) - new Date(a.date));
        if (historyForCourse.length > 0) {
            historyForCourse.forEach(h => {
                    let statusClass = h.status === 'Present' ? 'text-green-500' : 'text-red-500';
                    if(h.status === 'Cancelled') statusClass = 'text-gray-500';
                    const reasonDisplay = h.reason ? `<span class="text-xs italic ml-1 text-yellow-400">(${h.reason})</span>` : '';
                    const logEntry = document.createElement('div');
                    logEntry.className = 'flex justify-between items-center p-2 bg-white/5 rounded mb-1';
                    logEntry.innerHTML = `
                    <div>
                        <span>${new Date(h.date + 'T00:00:00').toLocaleDateString()}</span>
                        <span class="font-bold ml-4 ${statusClass}">${h.status}</span>
                        ${reasonDisplay}
                        ${h.note ? `<p class="text-xs italic mt-1" style="color: var(--text-secondary);">${h.note}</p>` : ''}
                    </div>
                    <button class="add-note-btn text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded-md" data-history-id="${h.id}" aria-label="${h.note ? 'Edit note' : 'Add note'}" style="color: var(--text-secondary);">
                        ${h.note ? 'Edit Note' : 'Add Note'}
                    </button>
                    `;
                    logContainer.appendChild(logEntry);
            });
        } else {
            logContainer.innerHTML = `<p style="color: var(--text-secondary);">No attendance marked yet (or none within the current term).</p>`;
        }
    };
    const updateWhatIf = () => {
            const stats = calculateAttendanceForCourse(courseName);
            const missedClasses = parseInt(whatIfInput.value) || 0;
            if (missedClasses >= 0) {
            const futureTotal = stats.total + missedClasses;
            const futurePercentage = futureTotal === 0 ? 100 : Math.round((stats.present / futureTotal) * 100);
            const goal = parseInt(goalInput.value) || 75;
            whatIfOutput.textContent = `Your attendance would be ${futurePercentage}%.`;
            whatIfOutput.style.color = futurePercentage < goal ? '#ef4444' : '#22c55e';
            }
    }
    goalInput.oninput = () => { updateDetails(); updateWhatIf(); };
    whatIfInput.oninput = updateWhatIf;
    updateDetails();
    toggleModal(document.getElementById('course-details-modal'), true);
}