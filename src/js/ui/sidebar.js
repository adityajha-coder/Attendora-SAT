import { renderReports } from '../features/attendance.js';

export function handleSidebarNav(e) {
    e.preventDefault();
    const link = e.target.closest('a.sidebar-link');
    if (!link) return;
    const viewId = link.getAttribute('href').substring(1);
    navigateTo(viewId);
    if (window.innerWidth < 768) {
        closeMobileSidebar();
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

export function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const isHidden = sidebar.classList.contains('-translate-x-full');
    
    if (isHidden) {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden', 'opacity-0');
    } else {
        closeMobileSidebar();
    }
}

export function closeMobileSidebar() {
    document.getElementById('sidebar').classList.add('-translate-x-full');
    document.getElementById('sidebar-overlay').classList.add('hidden', 'opacity-0');
}
