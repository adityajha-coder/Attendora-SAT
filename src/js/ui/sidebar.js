// Handles navigation between UI tabs and manages the mobile drawer state.
import { renderReports } from '../features/attendance.js';
import { setCurrentView, dirtyViews, renderView } from '../main.js';

export function handleSidebarNav(e) {
    const target = e.target;
    if (target.closest('#mobile-menu-btn')) {
        return;
    }

    const navItem = target.closest('a[href^="#"], button[data-view], [data-view]');
    if (!navItem) return;

    let viewId = navItem.dataset ? navItem.dataset.view : null;
    if (!viewId) {
        const href = navItem.getAttribute('href');
        if (!href || href === '#') return;
        viewId = href.startsWith('#') ? href.substring(1) : href;
    }

    if (e) e.preventDefault();
    navigateTo(viewId);

    if (window.innerWidth < 768) {
        closeMobileSidebar();
    }
}

export function navigateTo(viewId) {
    if (!viewId) return;
    const cleanId = viewId.startsWith('#') ? viewId.substring(1) : viewId;

    document.querySelectorAll('#sidebar-nav a, #sidebar-nav [data-view]').forEach(a => a.classList.remove('active'));
    document.querySelectorAll('#mobile-bottom-nav a, #mobile-bottom-nav button, #mobile-bottom-nav .bottom-nav-link').forEach(a => {
        if (!a.id || a.id !== 'mobile-menu-btn') {
            a.classList.remove('active', 'text-blue-400');
            a.classList.add('text-gray-400');
        }
    });

    const link = document.querySelector(`#sidebar-nav a[href="#${cleanId}"], #sidebar-nav [data-view="${cleanId}"]`);
    if (link) link.classList.add('active');

    const bottomLink = document.querySelector(`#mobile-bottom-nav a[href="#${cleanId}"], #mobile-bottom-nav [data-view="${cleanId}"], #mobile-bottom-nav a[href="#${cleanId}"]`);
    if (bottomLink) {
        bottomLink.classList.add('active', 'text-blue-400');
        bottomLink.classList.remove('text-gray-400');
    }

    const targetId = cleanId + '-view';
    requestAnimationFrame(() => {
        document.querySelectorAll('.dashboard-view').forEach(view => {
            const isActive = view.id === targetId;
            view.classList.toggle('active', isActive);
        });

        // Update lazy rendering
        setCurrentView(cleanId);

        if (dirtyViews.has(cleanId)) {
            renderView(cleanId);
        }
        if (cleanId === 'reports' || cleanId === 'overview') {
            setTimeout(() => {
                renderReports();
            }, 50);
        }
    });
}

export function syncSidebarVisibility() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar) return;

    if (window.innerWidth >= 768) {
        sidebar.classList.remove('open', '-translate-x-full');
        sidebar.classList.add('translate-x-0');
        if (overlay) {
            overlay.classList.add('hidden', 'opacity-0');
        }
        document.body.style.overflow = '';
    } else {
        sidebar.classList.remove('open');
        sidebar.classList.add('-translate-x-full');
        if (overlay) {
            overlay.classList.add('hidden', 'opacity-0');
        }
        document.body.style.overflow = '';
    }
}

let lastOpenTimestamp = 0;

export function toggleMobileSidebar(e) {
    if (e) {
        if (typeof e.preventDefault === 'function') e.preventDefault();
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
        if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
    }
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar || !overlay) return;

    if (window.innerWidth >= 768) return;

    const isOpen = sidebar.classList.contains('open');

    if (!isOpen) {
        lastOpenTimestamp = Date.now();
        sidebar.classList.add('open', 'translate-x-0');
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden', 'opacity-0');
        document.body.style.overflow = 'hidden';
    } else {
        closeMobileSidebar();
    }
}

export function closeMobileSidebar() {
    if (Date.now() - lastOpenTimestamp < 300) {
        return;
    }

    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (sidebar) {
        sidebar.classList.remove('open', 'translate-x-0');
        if (window.innerWidth < 768) {
            sidebar.classList.add('-translate-x-full');
        }
    }

    if (overlay) {
        overlay.classList.add('hidden', 'opacity-0');
    }
    document.body.style.overflow = '';
}
