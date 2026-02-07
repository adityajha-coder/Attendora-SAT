Attendora

Attendora is a minimalist, professional web application for students to track class attendance, assignments, and GPA while earning achievement badges for consistent use. It is implemented as modular ES modules in a single-page application and includes Progressive Web App (PWA) support for offline caching and installability.

Status
- Under development — features and UI are actively being refined.

Overview
- Manage a personal class schedule and mark daily attendance.
- Track attendance history per class and compute course-level percentages and streaks.
- Calculate GPA from logged courses and credits.
- Track assignments (quizzes, exams, projects) and upcoming deadlines.
- Earn achievements as you use the app and generate a semester summary ("Semester Wrapped").
- Basic offline capability via a service worker and `manifest.json` for PWA installability.

Core features (detailed)
- Schedule management: add, edit, and remove class entries with metadata (name, day/time, credits).
- Attendance marking: mark Present/Absent/Cancelled, view and export history (CSV supported).
- Course analytics: per-course attendance percentage, longest streak, and recovery detection for courses that improve over time.
- GPA calculator: record courses with credits and grades to compute a running GPA.
- Assignments: add assignments linked to courses, view upcoming assignments, and mark them complete.
- Gamification: predefined achievement set (`ALL_ACHIEVEMENTS`) that tracks progress and unlocks badges shown on the dashboard.
- Semester summary: auto-generated summary showing best/worst courses, streaks, achievements unlocked, and GPA for the term.

Architecture & important files
- `index.html` — app shell and module bootstrap (loads `src/js/main.js` as an ES module).
- `src/js/` — application modules:
	- `main.js` — entry point and view orchestration
	- `state.js` — central state management and persistence helpers
	- `ui.js` — DOM rendering utilities, modals, and toasts
	- `attendance.js` — attendance marking, charts, and reports
	- `academics.js` — GPA and assignment logic
	- `gamification.js` — achievements and semester summary generation
	- `utils.js` — shared helper functions
- `src/style/style.css` — main stylesheet
- `sw.js` — service worker responsible for caching key assets
- `manifest.json` — PWA manifest metadata and icons

Data & persistence
- App data is persisted locally using `localStorage` (no backend required for the offline-first experience).
- Export/import utilities allow backing up and restoring application state.

Development notes
- The codebase uses vanilla ES modules; serve `index.html` from a static server during development to avoid module loading issues due to direct file access.
- Check the browser DevTools Console and Network tab for errors related to module imports or missing assets.

------------- Under Development---------------------
