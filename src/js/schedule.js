import { state, saveData, dateIsWithinTerm } from './state.js';
import { updateAllViews } from './main.js';
import { checkAchievements } from './gamification.js';
import { showConfirmationModal, showToast, toggleModal } from './ui.js';
import { minutesToTime, timeToMinutes } from './utils.js';

export function renderSchedule() {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = new Date().toLocaleString('en-us', { weekday: 'long' });
    const scheduleContainer = document.querySelector('#schedule-view .overflow-x-auto');
    const scheduleEmptyPrompt = document.getElementById('schedule-empty-prompt');
    if (state.schedule.length === 0) {
        scheduleContainer.classList.add('hidden');
        scheduleEmptyPrompt.classList.remove('hidden');
        return;
    } else {
        scheduleContainer.classList.remove('hidden');
        scheduleEmptyPrompt.classList.add('hidden');
    }
    scheduleContainer.innerHTML = `<div class="grid grid-cols-7 min-w-[700px] gap-2 md:gap-4" id="schedule-grid"></div>`;
    const scheduleGrid = document.getElementById('schedule-grid');
    days.forEach(day => {
        const dayCol = document.createElement('div');
        dayCol.className = `space-y-4 p-2 rounded-lg ${day === today ? 'bg-white/5' : ''}`;
        dayCol.innerHTML = `<h3 class="text-xl font-bold text-center border-b-2 pb-2" style="border-color: var(--card-border);">${day}</h3>`;
        const classesForDay = state.schedule.filter(c => c.day === day).sort((a, b) => a.start.localeCompare(b.start));
        if (classesForDay.length > 0) {
            classesForDay.forEach(c => {
                let typeIndicator = '';
                if (c.type === 'Lab') typeIndicator = `<div class="absolute top-2 left-2 text-xs font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Lab</div>`;
                else if (c.type === 'Class & Lab') typeIndicator = `<div class="absolute top-2 left-2 text-xs font-bold bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">Hybrid</div>`;
                const classCard = document.createElement('div');
                classCard.className = 'p-3 bg-white/5 rounded-lg relative group pt-8';
                classCard.innerHTML = `
                    ${typeIndicator}
                    <div class="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="edit-class-btn p-2" data-class-id="${c.id}" title="Edit" role="button" aria-label="Edit class ${c.name}" style="color: var(--text-secondary);"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 pointer-events-none" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg></button>
                        <button class="delete-class-btn p-2 text-red-400" data-class-id="${c.id}" title="Delete" role="button" aria-label="Delete class ${c.name}"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 pointer-events-none" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button>
                    </div>
                    <p class="font-semibold">${c.name}</p>
                    <p class="text-sm" style="color: var(--text-secondary);">${c.start} - ${c.end}</p>
                    ${c.room ? `<p class="text-xs italic" style="color: var(--text-secondary);">${c.room}</p>` : ''}
                    ${c.instructor ? `<p class="text-xs italic" style="color: var(--text-secondary);">(${c.instructor})</p>` : ''}
                `;
                dayCol.appendChild(classCard);
            });
        } else {
            dayCol.innerHTML += `<div class="text-center text-sm py-4 h-full flex items-center justify-center" style="color: var(--text-secondary);">No Classes</div>`;
        }
        scheduleGrid.appendChild(dayCol);
    });
}

export function renderTodaysClasses() {
    const upcomingClassesList = document.getElementById('upcoming-classes-list');
    const today = new Date().toLocaleString('en-us', { weekday: 'long' });
    const todayDateStr = new Date().toISOString().slice(0, 10);
    const upcomingClasses = state.schedule.filter(c => c.day === today);
    upcomingClassesList.innerHTML = '';
    if (!dateIsWithinTerm(todayDateStr)) {
            upcomingClassesList.innerHTML = `<li class="text-center py-4 text-red-400 font-semibold">Current term has ended (${new Date(state.settings.termEndDate + 'T00:00:00').toLocaleDateString()}).</li>`;
            return;
    }
    let classesRendered = false;
    if (upcomingClasses.length > 0) {
        upcomingClasses.forEach(c => {
            const li = document.createElement('li');
            li.className = 'flex flex-col sm:flex-row justify-between items-center gap-2 p-3 bg-white/5 rounded-lg';
            const historyEntry = state.history.find(h => h.classId === c.id && h.date === todayDateStr);
            let statusHTML = '';
            if (historyEntry) {
                let statusClass = '';
                if (historyEntry.status === 'Present') statusClass = 'text-green-500';
                else if (historyEntry.status === 'Absent') statusClass = 'text-red-500';
                else statusClass = 'text-gray-500';
                const reasonText = historyEntry.reason ? ` (${historyEntry.reason})` : '';
                statusHTML = `<div class="flex items-center gap-2">
                    <span class="font-bold ${statusClass}">${historyEntry.status}${reasonText}</span>
                    <button data-class-id="${c.id}" data-history-id="${historyEntry.id}" data-course-name="${c.name}" class="edit-status-btn text-blue-400 hover:text-blue-300 text-sm" aria-label="Edit attendance status for ${c.name}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                    </button>
                </div>`;
            } else {
                statusHTML = `<div class="flex items-center gap-2">
                    <button data-class-id="${c.id}" data-status="Present" class="attendance-btn border-green-500 text-green-500 hover:bg-green-500 hover:text-white" aria-label="Mark ${c.name} Present">Present</button>
                    <button data-class-id="${c.id}" data-status="Absent" class="attendance-btn border-red-500 text-red-500 hover:bg-red-500 hover:text-white" aria-label="Mark ${c.name} Absent">Absent</button>
                    <button data-class-id="${c.id}" data-status="Cancelled" class="attendance-btn border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white" aria-label="Mark ${c.name} Cancelled">Cancel</button>
                </div>`;
            }
            li.innerHTML = `<div><span class="font-semibold">${c.name}</span> <span class="text-sm" style="color: var(--text-secondary);">(${c.start})</span></div> ${statusHTML}`;
            upcomingClassesList.appendChild(li);
            classesRendered = true;
        });
    } 
    if (!classesRendered) {
        upcomingClassesList.innerHTML = `<li class="text-center py-4" style="color: var(--text-secondary);">No classes scheduled for today. Relax!</li>`;
    }
}

export function openClassModal(day = null, type = 'Class') {
    document.getElementById('class-form').reset();
    document.getElementById('editing-class-id').value = '';
    document.getElementById('class-modal-title').textContent = `Add a New ${type}`;
    document.getElementById('course-type').value = type;
    if (day) document.getElementById('day-of-week').value = day;
    document.getElementById('time-validation-error').classList.add('hidden');
    document.getElementById('end-time').classList.remove('is-invalid');
    document.getElementById('duration-feedback').textContent = 'Duration: 0 minutes';
    document.getElementById('duration-preset').value = 0;
    toggleModal(document.getElementById('class-modal'), true);
}

export function populateModalForEdit(classId) {
    const classToEdit = state.schedule.find(c => c.id === classId);
    if (!classToEdit) return;
    document.getElementById('editing-class-id').value = classToEdit.id;
    document.getElementById('class-modal-title').textContent = 'Edit Class';
    document.getElementById('course-name').value = classToEdit.name;
    document.getElementById('instructor-name').value = classToEdit.instructor || ''; 
    document.getElementById('room-number').value = classToEdit.room || ''; 
    document.getElementById('day-of-week').value = classToEdit.day;
    document.getElementById('course-type').value = classToEdit.type;
    document.getElementById('start-time').value = classToEdit.start;
    document.getElementById('end-time').value = classToEdit.end;
    document.getElementById('time-validation-error').classList.add('hidden');
    document.getElementById('end-time').classList.remove('is-invalid');
    document.getElementById('duration-preset').value = 0;
    updateDurationFeedback(); 
    toggleModal(document.getElementById('class-modal'), true);
}

export function handleClassFormSubmit(e) {
    e.preventDefault();
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    const errorDiv = document.getElementById('time-validation-error');
    const endTimeInput = document.getElementById('end-time');
    if (endTime <= startTime) {
        errorDiv.classList.remove('hidden');
        endTimeInput.classList.add('is-invalid');
        return; 
    } else {
        errorDiv.classList.add('hidden');
        endTimeInput.classList.remove('is-invalid');
    }
    const editingId = parseFloat(document.getElementById('editing-class-id').value);
    const classData = { 
        name: document.getElementById('course-name').value, 
        instructor: document.getElementById('instructor-name').value, 
        room: document.getElementById('room-number').value, 
        day: document.getElementById('day-of-week').value, 
        type: document.getElementById('course-type').value, 
        start: startTime, 
        end: endTime,
    };
    if (editingId) {
        const index = state.schedule.findIndex(c => c.id === editingId);
        if (index > -1) {
            const oldClassName = state.schedule[index].name;
            const newClassName = classData.name;
            state.schedule[index] = { ...state.schedule[index], ...classData };
            if (oldClassName !== newClassName) {
                state.schedule.forEach(c => {
                    if (c.name === oldClassName) {
                        c.name = newClassName;
                    }
                });
                state.assignments.forEach(a => {
                    if (a.course === oldClassName) {
                        a.course = newClassName;
                    }
                });
                state.gpaCourses.forEach(g => {
                    if (g.name === oldClassName) {
                        g.name = newClassName;
                    }
                });
                showToast(`Renamed course '${oldClassName}' to '${newClassName}'.`);
            }
        }
    } else {
        state.schedule.push({ id: Date.now(), ...classData });
    }
    state.schedule.sort((a,b) => a.start.localeCompare(b.start)); 
    checkAchievements();
    saveData();
    updateAllViews();
    toggleModal(document.getElementById('class-modal'), false); 
}

export function handleDeleteClass(classId) {
    const classToDelete = state.schedule.find(c => c.id === classId);
    if (!classToDelete) return;
    const title = `Delete '${classToDelete.name}'?`;
    const message = `Are you sure? This specific class entry will be deleted. If this is the last class for this course, all data associated with it will rely on the name alone.`;
    showConfirmationModal(title, message, () => {
        const courseName = classToDelete.name;
        state.schedule = state.schedule.filter(c => c.id !== classId);
        state.history = state.history.filter(h => h.classId !== classId); 
        showToast(`Class from '${courseName}' deleted.`);
        saveData();
        updateAllViews();
    });
}

export function updateDurationFeedback() {
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const feedbackDiv = document.getElementById('duration-feedback');
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;
    if (startTime && endTime) {
        const startMin = timeToMinutes(startTime);
        const endMin = timeToMinutes(endTime);
        let durationMin = endMin - startMin;
        if (durationMin < 0) durationMin = 0;
        const hours = Math.floor(durationMin / 60);
        const minutes = durationMin % 60;
        let durationText = '';
        if (hours > 0) durationText += `${hours} hour${hours > 1 ? 's' : ''}`;
        if (minutes > 0) durationText += `${hours > 0 && minutes > 0 ? ' and ' : ''}${minutes} minute${minutes > 1 ? 's' : ''}`;
        if (durationText === '') durationText = '0 minutes';
        feedbackDiv.textContent = `Duration: ${durationText}`;
        const errorDiv = document.getElementById('time-validation-error');
        if (endMin <= startMin) {
            errorDiv.classList.remove('hidden');
            endTimeInput.classList.add('is-invalid');
        } else {
            errorDiv.classList.add('hidden');
            endTimeInput.classList.remove('is-invalid');
        }
    } else {
        feedbackDiv.textContent = 'Duration: 0 minutes';
    }
}

export function handleDurationPreset(e) {
    const duration = parseInt(e.target.value); 
    if (duration === 0) return; 
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const startTime = startTimeInput.value;
    if (startTime) {
        const startMin = timeToMinutes(startTime);
        const endMin = startMin + duration;
        endTimeInput.value = minutesToTime(endMin % (24 * 60)); 
        updateDurationFeedback();
    } else {
        showToast("Please set a Start Time first.", "warning");
        e.target.value = 0; 
    }
}

export function openTimetableScanner() {
    const scanTimetableModal = document.getElementById('scan-timetable-modal');
    scanTimetableModal.querySelector('#scan-upload-view').classList.remove('hidden');
    scanTimetableModal.querySelector('#scan-processing-view').classList.add('hidden');
    scanTimetableModal.querySelector('#scan-correction-view').classList.add('hidden');
    document.getElementById('timetable-file-input').value = '';
    toggleModal(scanTimetableModal, true);
}

export async function handleTimetableScan(event) {
    const file = event.target.files[0];
    if (!file) return;
    const scanTimetableModal = document.getElementById('scan-timetable-modal');
    scanTimetableModal.querySelector('#scan-upload-view').classList.add('hidden');
    scanTimetableModal.querySelector('#scan-processing-view').classList.remove('hidden');
    showToast("Note: Timetable scanning relies on a multimodal AI (vision). Using simulation...", "warning");
    setTimeout(() => {
        const mockScannedData = [
            { day: 'Monday', start: '09:30', end: '10:20', name: 'Object-Oriented Programming', instructor: 'Dr. Jones', room: 'B301' },
            { day: 'Monday', start: '10:20', end: '11:10', name: 'Digital Logic Circuit Design', instructor: 'Prof. Lee', room: 'L405' },
            { day: 'Tuesday', start: '11:30', end: '13:00', name: 'Data Structures Lab', instructor: 'Ms. Chen', room: 'Lab A' },
            { day: 'Wednesday', start: '09:30', end: '11:10', name: 'Discrete Mathematics', instructor: 'Dr. Jones', room: 'B301' },
            { day: 'Thursday', start: '13:40', end: '15:20', name: 'Database Management', instructor: 'Prof. Lee', room: 'L405' },
            { day: 'Friday', start: '14:30', end: '15:20', name: 'Indian Knowledge Systems', instructor: 'Dr. Khan', room: 'A102' },
            { day: 'Friday', start: '15:20', end: '16:50', name: 'OOP Lab', instructor: 'Ms. Chen', room: 'Lab A' },
        ];
        renderCorrectionView(mockScannedData);
    }, 2500); 
}

function renderCorrectionView(scannedData) {
    const container = document.getElementById('correction-grid-container');
    container.innerHTML = `
        <table class="w-full text-left">
            <thead>
                <tr class="border-b border-white/10 text-xs sm:text-sm">
                    <th class="p-2">Day</th>
                    <th class="p-2">Start</th>
                    <th class="p-2">End</th>
                    <th class="p-2">Subject Name</th>
                    <th class="p-2">Instructor</th>
                    <th class="p-2">Room</th>
                </tr>
            </thead>
            <tbody id="correction-tbody"></tbody>
        </table>
    `;
    const tbody = document.getElementById('correction-tbody');
    const validDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    scannedData.forEach((entry) => {
        const day = validDays.find(d => entry.day && d.toLowerCase().startsWith(entry.day.toLowerCase().substring(0, 3))) || entry.day;
        const tr = document.createElement('tr');
        tr.className = 'border-b border-white/5';
        tr.innerHTML = `
            <td class="p-1"><input type="text" value="${day || ''}" class="form-input p-2 text-sm" data-field="day"></td>
            <td class="p-1"><input type="time" value="${entry.start || ''}" class="form-input p-2 text-sm" data-field="start"></td>
            <td class="p-1"><input type="time" value="${entry.end || ''}" class="form-input p-2 text-sm" data-field="end"></td>
            <td class="p-1"><input type="text" value="${entry.name || ''}" class="form-input p-2 text-sm" data-field="name"></td>
            <td class="p-1"><input type="text" value="${entry.instructor || ''}" class="form-input p-2 text-sm" data-field="instructor"></td>
            <td class="p-1"><input type="text" value="${entry.room || ''}" class="form-input p-2 text-sm" data-field="room"></td>
        `;
        tbody.appendChild(tr);
    });
    const scanTimetableModal = document.getElementById('scan-timetable-modal');
    scanTimetableModal.querySelector('#scan-processing-view').classList.add('hidden');
    scanTimetableModal.querySelector('#scan-correction-view').classList.remove('hidden');
}

export function handleSaveScannedSchedule() {
    const tbody = document.getElementById('correction-tbody');
    const rows = tbody.querySelectorAll('tr');
    let newClassesAdded = 0;
    let errorCount = 0;
    const newSchedule = []; 
    const validDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    rows.forEach(row => {
        const nameInput = row.querySelector('input[data-field="name"]');
        const dayInput = row.querySelector('input[data-field="day"]');
        const startInput = row.querySelector('input[data-field="start"]');
        const endInput = row.querySelector('input[data-field="end"]');
        const instructorInput = row.querySelector('input[data-field="instructor"]');
        const roomInput = row.querySelector('input[data-field="room"]');
        const name = nameInput.value.trim();
        const day = dayInput.value.trim();
        const start = startInput.value.trim();
        const end = endInput.value.trim();
        const instructor = instructorInput ? instructorInput.value.trim() : '';
        const room = roomInput ? roomInput.value.trim() : '';
        if (name && day && start && end) {
            if (!validDays.some(d => d.toLowerCase() === day.toLowerCase()) || end <= start) {
                    errorCount++;
                    return; 
            }
                const classData = { 
                id: Date.now() + Math.random(), 
                name: name, 
                instructor: instructor,
                room: room,
                day: day.charAt(0).toUpperCase() + day.slice(1).toLowerCase(), 
                type: name.toLowerCase().includes('lab') ? 'Lab' : 'Class', 
                start: start, 
                end: end,
            };
            newSchedule.push(classData);
            newClassesAdded++;
        }
    });
    if (errorCount > 0) {
            showToast(`${errorCount} entries were skipped due to invalid data (e.g., wrong day name or invalid time range).`, "warning");
    }
    if (newClassesAdded > 0) {
        state.schedule = newSchedule;
        state.history = []; 
        state.assignments = [];
        state.gpaCourses = []; 
        state.schedule.sort((a,b) => a.start.localeCompare(b.start)); 
        checkAchievements();
        saveData();
        updateAllViews();
        toggleModal(document.getElementById('scan-timetable-modal'), false); 
        showToast(`${newClassesAdded} classes added, replacing your old schedule!`);
    } else if(errorCount === 0) {
        showToast("No valid classes were found to save.", "error");
    }
}