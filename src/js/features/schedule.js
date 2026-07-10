// Handles creating, editing, and deleting classes in the schedule.
import { state, saveData, dateIsWithinTerm } from '../core/state.js';
import { checkAchievements } from './gamification.js';
import { showConfirmationModal, showToast, toggleModal } from '../ui/ui.js';
import { minutesToTime, timeToMinutes } from '../core/utils.js';

export function renderSchedule() {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = new Date().toLocaleString('en-us', { weekday: 'long' });
    const scheduleContainer = document.querySelector('#schedule-view .overflow-x-auto');
    const scheduleEmptyPrompt = document.getElementById('schedule-empty-prompt');
    if (state.schedule.length === 0) {
        scheduleContainer.classList.add('hidden');
        scheduleEmptyPrompt.classList.remove('hidden');
        scheduleEmptyPrompt.innerHTML = `
            <div class="py-20 px-6 text-center">
                <div class="mb-8 inline-flex p-6 rounded-full bg-cyan-500/10 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                    <svg class="h-16 w-16 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2.25 2.25 0 002.25-2.25V7a2.25 2.25 0 00-2.25-2.25H5A2.25 2.25 0 002.75 7v11.75A2.25 2.25 0 005 21z" />
                    </svg>
                </div>
                <h3 class="text-4xl font-black text-white mb-4 tracking-tight">Build your Weekly Schedule</h3>
                <p class="text-gray-400 text-lg mb-10 max-w-md mx-auto leading-relaxed">Upload a photo of your timetable or add your classes manually to start tracking.</p>
                <div class="flex flex-col sm:flex-row justify-center gap-4">
                    <button id="scan-timetable-prompt-btn" class="btn-primary text-white font-bold py-3.5 px-8 rounded-xl shadow-[0_10px_30px_rgba(59,130,246,0.3)] transition-all hover:scale-105 active:scale-95 animate-bounce">
                        Scan Timetable (AI)
                    </button>
                    <button id="add-class-prompt-btn" class="px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold text-white hover:scale-105 active:scale-95">
                        Add Manually
                    </button>
                </div>
            </div>
        `;
        return;
    } else {
        scheduleContainer.classList.remove('hidden');
        scheduleEmptyPrompt.classList.add('hidden');
    }
    scheduleContainer.innerHTML = `<div class="grid grid-cols-7 min-w-[1100px] gap-3 sm:gap-4" id="schedule-grid"></div>`;
    const scheduleGrid = document.getElementById('schedule-grid');
    days.forEach(day => {
        const classesForDay = state.schedule.filter(c => c.day === day).sort((a, b) => a.start.localeCompare(b.start));
        
        const isToday = day === today;

        const dayCol = document.createElement('div');
        dayCol.className = `space-y-3 p-2 sm:p-3 rounded-xl border border-white/5 bg-white/[0.02] ${isToday ? 'bg-white/5 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : ''}`;
        dayCol.innerHTML = `<h3 class="text-sm sm:text-base font-bold text-center border-b border-white/10 pb-2 mb-3 text-white tracking-wide">${day}</h3>`;
        
        if (classesForDay.length > 0) {
            classesForDay.forEach(c => {
                let typeIndicator = '';
                if (c.type === 'Lab') typeIndicator = `<div class="absolute top-2 left-2 text-[10px] uppercase font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full tracking-wider border border-green-500/20">Lab</div>`;
                else if (c.type === 'Class & Lab') typeIndicator = `<div class="absolute top-2 left-2 text-[10px] uppercase font-bold bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full tracking-wider border border-purple-500/20">Hybrid</div>`;
                
                const classCard = document.createElement('div');
                classCard.className = 'p-4 bg-black/40 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-xl relative group transition-all duration-200';
                
                classCard.innerHTML = `
                    ${typeIndicator}
                    <div class="absolute top-2 right-2 flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button class="edit-class-btn p-1.5 bg-white/10 hover:bg-blue-500/80 rounded-md text-gray-300 hover:text-white transition-colors backdrop-blur-sm" data-class-id="${c.id}" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 pointer-events-none" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg></button>
                        <button class="delete-class-btn p-1.5 bg-white/10 hover:bg-red-500/80 rounded-md text-gray-300 hover:text-white transition-colors backdrop-blur-sm" data-class-id="${c.id}" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 pointer-events-none" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button>
                    </div>
                    <div class="${typeIndicator ? 'mt-4' : ''}">
                        <h4 class="font-bold text-white text-sm sm:text-base leading-snug mb-2.5 pr-14">${c.name}</h4>
                        <div class="space-y-2">
                            <div class="flex items-center text-[11px] sm:text-xs text-gray-300 font-medium mt-1 mb-1">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1.5 opacity-70" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" /></svg>
                                ${c.start} - ${c.end}
                            </div>
                            ${c.room ? `<div class="flex items-start text-[11px] sm:text-xs text-gray-400 mt-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1.5 opacity-70 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /></svg><span class="leading-tight">${c.room}</span></div>` : ''}
                            ${c.instructor ? `<div class="flex items-start text-[11px] sm:text-xs text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1.5 opacity-70 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg><span class="leading-tight">${c.instructor}</span></div>` : ''}
                        </div>
                    </div>
                `;
                dayCol.appendChild(classCard);
            });
        } else {
            dayCol.innerHTML += `<div class="text-center text-xs sm:text-sm py-6 h-full flex items-center justify-center text-gray-500 italic">No Classes</div>`;
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

    updateDurationFeedback(); 
    toggleModal(document.getElementById('class-modal'), true);
}

export function handleClassFormSubmit(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById('course-name');
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const errorDiv = document.getElementById('time-validation-error');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    let hasError = false;

    const validateField = (input) => {
        if (!input.value.trim()) {
            input.classList.remove('shake');
            void input.offsetWidth; 
            input.classList.add('shake', 'input-error');
            hasError = true;
            input.addEventListener('input', () => input.classList.remove('input-error'), { once: true });
        }
    };

    validateField(nameInput);
    validateField(startTimeInput);
    validateField(endTimeInput);

    if (startTimeInput.value && endTimeInput.value && endTimeInput.value <= startTimeInput.value) {
        errorDiv.classList.remove('hidden');
        endTimeInput.classList.remove('shake');
        void endTimeInput.offsetWidth;
        endTimeInput.classList.add('shake', 'input-error');
        hasError = true;
        endTimeInput.addEventListener('input', () => endTimeInput.classList.remove('input-error'), { once: true });
    } else if (!hasError) {
        errorDiv.classList.add('hidden');
    }

    if (hasError) {
        import('../ui/ui.js').then(module => module.showToast("Please fill out all required fields correctly.", "warning"));
        return;
    }
    
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="btn-spinner"></span> Saving...`;

    setTimeout(() => {
    const editingId = parseFloat(document.getElementById('editing-class-id').value);
        const classData = { 
            name: nameInput.value, 
            instructor: document.getElementById('instructor-name').value, 
            room: document.getElementById('room-number').value, 
            day: document.getElementById('day-of-week').value, 
            type: document.getElementById('course-type').value, 
            start: startTimeInput.value, 
            end: endTimeInput.value,
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
                    import('../ui/ui.js').then(module => module.showToast(`Renamed course '${oldClassName}' to '${newClassName}'.`));
                }
            }
        } else {
            state.schedule.push({ id: Date.now(), ...classData });
        }
        state.schedule.sort((a,b) => a.start.localeCompare(b.start)); 
        checkAchievements();
        saveData();
        window.dispatchEvent(new CustomEvent('attendora-update-ui'));
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        import('../ui/ui.js').then(module => module.toggleModal(document.getElementById('class-modal'), false));
    }, 400); 
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
        window.dispatchEvent(new CustomEvent('attendora-update-ui'));
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
