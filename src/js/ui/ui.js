// Reusable UI components like modals, toasts, and theme pickers.
import { state, THEMES, applyTheme, applyLightMode, saveData } from '../core/state.js';
import { renderReports } from '../features/attendance.js';

export const toggleModal = (modal, show) => {
    if (!modal) return;
    if (show) {
        modal.classList.remove('opacity-0', 'pointer-events-none');
        modal.querySelector('.modal-content').classList.remove('scale-95');
        const input = modal.querySelector('input');
        if (input) setTimeout(() => input.focus(), 100);
    } else {
        modal.classList.add('opacity-0', 'pointer-events-none');
        modal.querySelector('.modal-content').classList.add('scale-95');
    }
};

let toastTimeout = null;
export const showToast = (message, type = 'success') => {
    const toast = document.getElementById('toast');

    const icons = {
        success: `<svg class="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
        error: `<svg class="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
        warning: `<svg class="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`,
        info: `<svg class="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
    };
    
    const icon = icons[type] || icons.info;

    toast.innerHTML = `<div class="flex items-center gap-3">${icon}<span>${message}</span></div>`;
    
    toast.className = 'fixed bottom-[90px] md:bottom-8 right-4 md:right-8 p-4 rounded-xl text-white font-bold shadow-2xl z-50 flex items-center toast-enter'; 
    
    if (type === 'success') {
        toast.classList.add('bg-gradient-to-r', 'from-green-500', 'to-emerald-600');
    } else if (type === 'error') {
        toast.classList.add('bg-gradient-to-r', 'from-red-500', 'to-rose-600');
    } else if (type === 'warning') {
        toast.classList.add('bg-gradient-to-r', 'from-amber-500', 'to-orange-500');
    } else {
        toast.classList.add('bg-gradient-to-r', 'from-blue-500', 'to-indigo-600');
    }
    
    if (toastTimeout) clearTimeout(toastTimeout);
    
    toastTimeout = setTimeout(() => {
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-exit');
    }, 3500);
};

export const showConfirmationModal = (title, message, onConfirm) => {
    const confirmationModal = document.getElementById('confirmation-modal');
    document.getElementById('confirmation-title').textContent = title;
    document.getElementById('confirmation-message').textContent = message;
    const confirmBtn = document.getElementById('confirm-action-btn');
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    newConfirmBtn.addEventListener('click', () => {
        onConfirm();
        toggleModal(confirmationModal, false); 
    }, { once: true });
    toggleModal(confirmationModal, true);
};

export const renderThemePicker = () => {
    const picker = document.getElementById('theme-picker');
    if (!picker) return;
    picker.innerHTML = '';
    Object.keys(THEMES).forEach(key => {
        const theme = THEMES[key];
        const swatch = document.createElement('button');
        swatch.className = `w-6 h-6 rounded-full cursor-pointer border-2 ${state.settings.selectedTheme === key ? 'border-blue-500' : 'border-transparent'}`;
        swatch.style.background = `linear-gradient(45deg, ${theme.start}, ${theme.end})`;
        swatch.dataset.theme = key;
        swatch.title = theme.name;
        picker.appendChild(swatch);
    });
};

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.overview-card:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

export function filterGrid(searchTerm, gridSelector, itemSelector) {
    const term = searchTerm.toLowerCase();
    const items = document.querySelector(gridSelector).querySelectorAll(itemSelector);
    items.forEach(item => {
        const content = item.dataset.searchContent || item.textContent.toLowerCase();
        item.style.display = content.includes(term) ? '' : 'none';
    });
}

export function filterTable(searchTerm, tbodySelector) {
    const term = searchTerm.toLowerCase();
    const rows = document.querySelector(tbodySelector).querySelectorAll('tr');
    rows.forEach(row => {
        const content = row.dataset.searchContent || row.textContent.toLowerCase();
        row.style.display = content.includes(term) ? '' : 'none';
    });
}

export function renderCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    const header = document.getElementById('month-year-header');
    if (!calendarGrid || !header) return;
    
    calendarGrid.innerHTML = '';
    const date = state.currentCalendarDate || new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    
    header.textContent = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = "calendar-day empty";
        calendarGrid.appendChild(emptyDay);
    }

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        const historyForDay = state.history.filter(h => h.date === dateStr);
        const assignmentsForDay = state.assignments.filter(a => a.dueDate === dateStr);
        
        const counts = {
            P: historyForDay.filter(h => h.status === 'Present').length,
            A: historyForDay.filter(h => h.status === 'Absent').length,
            C: historyForDay.filter(h => h.status === 'Cancelled').length
        };

        const hasStats = counts.P > 0 || counts.A > 0 || counts.C > 0;
        const isToday = dateStr === todayStr;
        
        dayEl.className = `calendar-day ${isToday ? 'is-today' : ''} flex flex-col items-center justify-center font-bold relative group overflow-hidden cursor-pointer`;
        dayEl.setAttribute('data-date', dateStr);
        dayEl.onclick = () => showDayDetails(dateStr);
        
        let statusIndicators = '';
        let statsPill = '';
        if (hasStats) {
            statsPill = `
                <div class="day-stats-pill z-10">
                    ${counts.P > 0 ? `<span class="text-green-400">${counts.P}P</span>` : ''}
                    ${counts.A > 0 ? `<span class="text-red-400 ml-1">${counts.A}A</span>` : ''}
                </div>
            `;
            statusIndicators = `
                <div class="day-indicators-container">
                    <div class="status-bar present-bar" style="height: ${counts.P > 0 ? (counts.P / (counts.P + counts.A + counts.C)) * 100 : 0}%" title="Present"></div>
                    <div class="status-bar absent-bar" style="height: ${counts.A > 0 ? (counts.A / (counts.P + counts.A + counts.C)) * 100 : 0}%" title="Absent"></div>
                </div>
            `;
        }

        dayEl.innerHTML = `
            <span class="day-number z-10">${day}</span>
            ${statsPill}
            ${statusIndicators}
            ${assignmentsForDay.length > 0 ? `<div class="assignment-indicator" title="${assignmentsForDay.map(a => a.title).join(', ')}"></div>` : ''}
        `;
        
        calendarGrid.appendChild(dayEl);
    }
}

export function showDayDetails(dateStr) {
    const history = state.history.filter(h => h.date === dateStr);
    const dayTitle = document.getElementById('calendar-day-title');
    const dayLog = document.getElementById('calendar-day-log');
    const modal = document.getElementById('calendar-day-details-modal');

    if (!dayTitle || !dayLog || !modal) return;

    const dateObj = new Date(dateStr + 'T00:00:00');
    dayTitle.textContent = dateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
    
    if (history.length === 0) {
        dayLog.innerHTML = `<p class="text-gray-500 text-center py-4 italic">No attendance records for this day.</p>`;
    } else {
        dayLog.innerHTML = history.map(h => {
             const statusColor = h.status === 'Present' ? 'text-green-400' : (h.status === 'Absent' ? 'text-red-400' : 'text-gray-400');
             const scheduleItem = state.schedule.find(s => s.id === h.classId);
             const courseName = scheduleItem ? scheduleItem.name : 'Unknown Course';
             const type = scheduleItem ? scheduleItem.type : 'Class';
             
             let detailsHtml = '';
             if (h.reason && h.reason !== 'AUTOMATED') {
                 detailsHtml += `<p class="text-xs italic text-yellow-400 mt-1">Reason: ${h.reason}</p>`;
             }
             if (h.note) {
                 detailsHtml += `<p class="text-xs italic mt-1" style="color: var(--text-secondary);"><span class="font-semibold">Note:</span> ${h.note}</p>`;
             }

             return `
                <div class="p-3 bg-white/5 rounded-lg flex flex-col mb-2">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="font-bold text-white">${courseName}</p>
                            <p class="text-xs text-gray-500">${type}</p>
                        </div>
                        <div class="text-right">
                            <span class="font-black ${statusColor}">${h.status.toUpperCase()}</span>
                        </div>
                    </div>
                    ${detailsHtml ? `<div class="mt-2 pt-2 border-t border-white/10">${detailsHtml}</div>` : ''}
                </div>
             `;
        }).join('');
    }

    toggleModal(modal, true);
}