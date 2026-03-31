import { showToast } from './ui.js';
import { state, saveData } from '../core/state.js';

export function startOnboardingTour() {
    if (typeof introJs !== 'function') {
        showToast("Onboarding guide is still loading...", "warning");
        return;
    }
    const intro = introJs();
    intro.setOptions({
        steps: [
            { element: '#sidebar', intro: "Welcome to Attendora! Match your classes and track your attendance accurately." },
            { element: '#overview-card-attendance', intro: "Your overall attendance percentage and status will appear here." },
            { element: '#current-day-schedule', intro: "Quickly mark today's attendance directly from your dashboard." },
            { element: '#sidebar-nav-schedule', intro: "Go here to manually build or scan your semester timetable." },
            { element: '#sidebar-nav-academics', intro: "Track your GPA, assignments, and study notes in one place." }
        ],
        showProgress: true,
        showBullets: false
    });
    intro.start();
    intro.oncomplete(() => {
        state.settings.hasCompletedTour = true;
        saveData();
    });
    intro.onexit(() => {
        state.settings.hasCompletedTour = true;
        saveData();
    });
}
