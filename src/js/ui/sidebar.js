import { renderReports } from '../features/attendance.js';

export function handleSidebarNav(e) {
    e.preventDefault();
    const link = e.target.closest('a.sidebar-link') || e.target.closest('a.bottom-nav-link');
    if (!link) return;
    const viewId = link.getAttribute('href').substring(1);
    navigateTo(viewId);
    // Only close sidebar if we clicked a sidebar link (not a bottom nav link)
    if (window.innerWidth < 768 && e.target.closest('a.sidebar-link')) {
        closeMobileSidebar();
    }
}

export function navigateTo(viewId) {
    document.querySelectorAll('#sidebar-nav a').forEach(a => a.classList.remove('active'));
    document.querySelectorAll('#mobile-bottom-nav a').forEach(a => {
        a.classList.remove('active', 'text-blue-400');
        a.classList.add('text-gray-400');
    });

    const link = document.querySelector(`#sidebar-nav a[href="#${viewId}"]`);
    if (link) link.classList.add('active');

    const bottomLink = document.querySelector(`#mobile-bottom-nav a[href="#${viewId}"]`);
    if (bottomLink) {
        bottomLink.classList.add('active', 'text-blue-400');
        bottomLink.classList.remove('text-gray-400');
    }

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
        // Prevent background scrolling
        document.body.style.overflow = 'hidden';
    } else {
        closeMobileSidebar();
    }
}

export function closeMobileSidebar() {
    document.getElementById('sidebar').classList.add('-translate-x-full');
    document.getElementById('sidebar-overlay').classList.add('hidden', 'opacity-0');
    // Restore background scrolling
    document.body.style.overflow = '';
}
