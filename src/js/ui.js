import { state, THEMES, applyTheme, applyLightMode, saveData } from './state.js';
import { renderReports } from './attendance.js';

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

export const showToast = (message, type = 'success') => {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'fixed bottom-0 right-0 m-8 p-4 rounded-lg text-white font-bold shadow-lg transform translate-y-20 opacity-0 z-50'; 
    if (type === 'success') {
        toast.classList.add('bg-gradient-to-r', 'from-green-400', 'to-teal-500');
    } else if (type === 'error') {
        toast.classList.add('bg-gradient-to-r', 'from-red-500', 'to-orange-500');
    } else if (type === 'warning') {
            toast.classList.add('bg-gradient-to-r', 'from-yellow-500', 'to-orange-400');
    }
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
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

export function setupDraggableOverviewCards() {
    const grid = document.getElementById('overview-grid');
    let draggedItem = null;
    grid.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('overview-card')) {
            draggedItem = e.target;
            setTimeout(() => e.target.classList.add('dragging'), 0);
        }
    });
    grid.addEventListener('dragend', (e) => {
        if (draggedItem) {
            setTimeout(() => {
                draggedItem.classList.remove('dragging');
                draggedItem = null;
                const newOrder = [...grid.querySelectorAll('.overview-card')].map(card => card.id);
                state.settings.dashboardOrder = newOrder;
                saveData();
            }, 0);
        }
    });
    grid.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(grid, e.clientY);
        if (draggedItem) {
            if (afterElement == null) {
                grid.appendChild(draggedItem);
            } else {
                grid.insertBefore(draggedItem, afterElement);
            }
        }
    });
}

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
    calendarGrid.innerHTML = '';
    const date = state.currentCalendarDate;
    const year = date.getFullYear();
    const month = date.getMonth();
    header.textContent = `${date.toLocaleString('default', { month: 'long' })} ${year}`;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) {
        calendarGrid.innerHTML += `<div class="calendar-day empty"></div>`;
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const historyForDay = state.history.filter(h => h.date === dateStr);
        const assignmentsForDay = state.assignments.filter(a => a.dueDate === dateStr);
        let bgColor = 'bg-white/5';
        if (historyForDay.length > 0) {
            const present = historyForDay.filter(h => h.status === 'Present').length;
            const absent = historyForDay.filter(h => h.status === 'Absent').length;
            if (absent > 0) bgColor = 'bg-red-500/50';
            else if (present > 0) bgColor = 'bg-green-500/50';
        }
        dayEl.className = `calendar-day ${bgColor} flex items-center justify-center font-bold`;
        dayEl.textContent = day;
        if (assignmentsForDay.length > 0) {
            dayEl.innerHTML += `<div class="assignment-dot" title="${assignmentsForDay.map(a => a.title).join(', ')}"></div>`;
        }
        calendarGrid.appendChild(dayEl);
    }
}