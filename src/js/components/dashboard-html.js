export const dashboardHtml = `
    <div id="dashboard-app" class="hidden">
        <div class="relative min-h-screen md:flex">
            <div id="sidebar-overlay" class="fixed inset-0 bg-black/60 z-30 hidden md:hidden"></div>
            
            <aside id="sidebar" class="w-64 flex-shrink-0 bg-black/30 backdrop-blur-md border-r border-white/10 flex-col fixed inset-y-0 left-0 z-40 md:relative md:translate-x-0 transform -translate-x-full transition-transform duration-300 ease-in-out">
                <div class="h-20 flex items-center justify-center border-b border-white/10 px-4" data-intro="Welcome to Attendora! This is your sidebar for navigating through all the features." data-step="1">
                     <a href="#" class="flex items-center gap-3">
                        <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <defs><linearGradient id="logoGradientSidebar" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="var(--primary-color-start)"/><stop offset="100%" stop-color="var(--primary-color-end)"/></linearGradient></defs>
                           <circle cx="12" cy="12" r="10" stroke="url(#logoGradientSidebar)" stroke-width="2"/><path d="M8 12L11 15L16 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span class="text-2xl font-bold text-white hero-glow font-brand">ATTENDORA</span>
                    </a>
                </div>
                <nav id="sidebar-nav" class="flex-1 px-4 py-6 space-y-2">
                    <a href="#overview" class="sidebar-link active flex items-center gap-3 px-4 py-3" aria-label="Overview"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg><span>Overview</span></a>
                    <a href="#schedule" class="sidebar-link flex items-center gap-3 px-4 py-3" aria-label="My Schedule"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span>My Schedule</span></a>
                    <a href="#courses" class="sidebar-link flex items-center gap-3 px-4 py-3" aria-label="My Courses"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6"/></svg><span>My Courses</span></a>
                    <a href="#assignments" class="sidebar-link flex items-center gap-3 px-4 py-3" aria-label="Assignments"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg><span>Assignments</span></a>
                    <a href="#calendar" class="sidebar-link flex items-center gap-3 px-4 py-3" aria-label="Calendar"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><span>Calendar</span></a>
                    <a href="#reports" class="sidebar-link flex items-center gap-3 px-4 py-3" aria-label="Reports"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg><span>Reports</span></a>
                    <a href="#achievements" class="sidebar-link flex items-center gap-3 px-4 py-3" aria-label="Achievements"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg><span>Achievements</span></a>
                    <a href="#gpa" class="sidebar-link flex items-center gap-3 px-4 py-3" aria-label="GPA Calculator"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h3m-3-10l-1.5-1.5a1.5 1.5 0 00-2.12 0L9 7m0 10l-1.5 1.5a1.5 1.5 0 01-2.12 0L4 17m11-6l1.5 1.5a1.5 1.5 0 010 2.12L15 17m-6 0h2m5-11l-2.09-2.09a1.5 1.5 0 00-2.12 0L9 7m-5 5h2m2 0h2" /></svg><span>GPA Calculator</span></a>
                    <a href="#profile" class="sidebar-link flex items-center gap-3 px-4 py-3" aria-label="My Profile"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg><span>My Profile</span></a>
                </nav>
                <div class="px-4 py-6 border-t border-white/10 mt-auto">
                    <a id="report-bug-btn" href="https://mail.google.com/mail/?view=cm&to=attendora.help@gmail.com&su=Bug%20Report%20-%20Attendora&body=Please%20describe%20the%20bug%20you%20encountered%3A%0A%0ASteps%20to%20reproduce%3A%0A1.%20%0A2.%20%0A3.%20%0A%0AExpected%20behavior%3A%0A%0AActual%20behavior%3A%0A" target="_blank" rel="noopener noreferrer" class="w-full flex items-center justify-center gap-3 py-3 rounded-lg transition-colors mb-2 sidebar-link text-white hover:text-white no-underline" aria-label="Report a Bug"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M5.07 19H19a2 2 0 001.75-2.96l-6.93-12a2 2 0 00-3.5 0l-6.93 12A2 2 0 005.07 19z" /></svg><span>Report Bug</span></a>
                    <button id="settings-btn" class="w-full flex items-center justify-center gap-3 py-3 rounded-lg transition-colors mb-2 sidebar-link" aria-label="Open Settings"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>Settings</button>
                    <button id="logout-btn" class="w-full flex items-center justify-center gap-3 py-3 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors" aria-label="Logout"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>Logout</button>
                </div>
            </aside>

            <main class="flex-1 p-6 sm:p-10 overflow-y-auto">
                <div class="md:hidden flex justify-between items-center mb-6">
                    <button id="mobile-menu-btn" class="p-2" aria-label="Open menu">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    </button>
                    <span class="text-xl font-bold hero-glow font-brand text-white">ATTENDORA</span>
                    <div class="w-8"></div>
                </div>
                
                <div id="overview-view" class="dashboard-view active">
                    <div class="flex flex-wrap justify-between items-center gap-4 mb-8">
                        <div>
                            <h1 id="welcome-message" class="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome!</h1>
                            <p class="text-gray-400">Here's your smart summary for today. Drag cards to rearrange.</p>
                        </div>
                        <div id="cloud-sync-indicator" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 transition-all duration-300">
                            <svg class="h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M1 12.5A4.5 4.5 0 005.5 17H15a4 4 0 001.866-7.539 3.504 3.504 0 00-4.504-4.272A4.5 4.5 0 004.06 8.235 4.502 4.502 0 001 12.5z" />
                            </svg>
                            <span class="text-xs text-gray-500">Cloud saved</span>
                        </div>
                    </div>

                    <div id="goal-oriented-card" class="card p-6 rounded-xl mb-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hidden no-hover">
                        <h3 class="text-xl font-bold text-white mb-2">Smart Goal</h3>
                        <p id="goal-text" class="text-cyan-300 text-base"></p>
                    </div>

                    <div id="overview-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    </div>
                     <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
                         <div id="todays-schedule-card" class="card p-6 rounded-xl no-hover" data-intro="Your classes for today will appear here. Mark your attendance with a single click!" data-step="3">
                             <h3 class="text-xl font-bold text-white mb-4">Today's Schedule</h3>
                             <ul id="upcoming-classes-list" class="space-y-4"></ul>
                         </div>
                         <div class="card p-6 rounded-xl no-hover">
                             <h3 class="text-xl font-bold text-white mb-4">Upcoming Deadlines</h3>
                             <ul id="upcoming-assignments-list" class="space-y-4"></ul>
                         </div>
                     </div>
                </div>

                <div id="schedule-view" class="dashboard-view">
                     <div class="flex flex-wrap justify-between items-center gap-4 mb-8">
                        <h1 class="text-2xl sm:text-3xl font-bold text-white">My Weekly Schedule</h1>
                        <div class="flex gap-4">
                             <button id="scan-timetable-btn" class="bg-white/10 text-white font-semibold py-2 px-5 rounded-lg border border-white/20 hover:bg-white/20 transition-colors inline-flex items-center gap-2" aria-label="Scan timetable image"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm10.5 5.5a.5.5 0 000-1H10V5.5a.5.5 0 00-1 0V7H5.5a.5.5 0 000 1H9v4.5a.5.5 0 001 0V8h3.5z" clip-rule="evenodd" /><path d="M6.5 11.5a.5.5 0 000 1H10v1.5a.5.5 0 001 0V12h2.5a.5.5 0 000-1H11V9.5a.5.5 0 00-1 0V11H6.5z" /></svg>Scan Timetable</button>
                            <button id="add-class-btn" class="btn-primary text-white font-semibold py-2 px-5 rounded-lg" data-intro="Use this button to manually add a new class or lecture to your weekly schedule." data-step="2" aria-label="Add new class">Add Class</button>
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <div class="grid grid-cols-7 min-w-[700px] gap-2 md:gap-4" id="schedule-grid"></div>
                    </div>
                    <div id="schedule-empty-prompt" class="text-center py-16 card rounded-xl p-6 no-hover hidden">
                        <svg class="mx-auto h-24 w-24 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M12 15.75h.008v.008H12v-.008Zm-3.002 0h.008v.008h-.008v-.008Zm6.004 0h.008v.008h-.008v-.008Zm-3.002-3h.008v.008h-.008v-.008Zm3.002 0h.008v.008h-.008v-.008Zm-6.004 0h.008v.008h-.008v-.008Z" />
                        </svg>
                        <h3 class="mt-4 text-xl font-semibold text-white">Your schedule is empty</h3>
                        <p class="mt-1 text-gray-400">Get started by adding your classes manually or scanning your timetable.</p>
                        <div class="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                            <button id="scan-timetable-prompt-btn" class="btn-primary text-white font-semibold py-2 px-5 rounded-lg inline-flex items-center gap-2" aria-label="Scan timetable"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm10.5 5.5a.5.5 0 000-1H10V5.5a.5.5 0 00-1 0V7H5.5a.5.5 0 000 1H9v4.5a.5.5 0 001 0V8h3.5z" clip-rule="evenodd" /><path d="M6.5 11.5a.5.5 0 000 1H10v1.5a.5.5 0 001 0V12h2.5a.5.5 0 000-1H11V9.5a.5.5 0 00-1 0V11H6.5z" /></svg>Scan Timetable</button>
                            <button id="add-class-prompt-btn" class="bg-white/10 text-white font-semibold py-2 px-5 rounded-lg border border-white/20 hover:bg-white/20" aria-label="Add class manually">Add Class Manually</button>
                        </div>
                    </div>
                </div>
                
                <div id="courses-view" class="dashboard-view">
                    <div class="flex flex-wrap justify-between items-center gap-4 mb-8">
                        <h1 class="text-2xl sm:text-3xl font-bold text-white">My Courses</h1>
                        <input type="search" id="courses-search" placeholder="Search courses..." class="search-input w-full sm:w-64 px-4 py-2 rounded-lg text-white" data-intro="This view provides a quick summary of your attendance for all subjects." data-step="4" aria-label="Search courses">
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="courses-grid"></div>
                </div>
                
                <div id="assignments-view" class="dashboard-view">
                    <div class="flex flex-wrap justify-between items-center gap-4 mb-8">
                        <h1 class="text-2xl sm:text-3xl font-bold text-white">Assignments & Exams</h1>
                        <div class="flex items-center gap-4 w-full sm:w-auto">
                            <input type="search" id="assignments-search" placeholder="Search assignments..." class="search-input w-full sm:w-auto flex-grow px-4 py-2 rounded-lg text-white" aria-label="Search assignments">
                            <button id="add-assignment-btn" class="btn-primary text-white font-semibold py-2 px-5 rounded-lg flex-shrink-0" aria-label="Add new assignment">Add New</button>
                        </div>
                    </div>
                    <div id="assignments-list" class="space-y-4"></div>
                </div>

                <div id="calendar-view" class="dashboard-view">
                    <div class="flex justify-between items-center mb-8">
                        <h1 class="text-2xl sm:text-3xl font-bold text-white">Attendance Calendar</h1>
                        <div class="flex items-center gap-4">
                            <button id="prev-month-btn" class="p-2" aria-label="Previous month">&lt;</button>
                            <h2 id="month-year-header" class="text-xl font-bold text-white"></h2>
                            <button id="next-month-btn" class="p-2" aria-label="Next month">&gt;</button>
                        </div>
                    </div>
                    <div class="card rounded-xl p-4 sm:p-6 no-hover">
                        <div class="grid grid-cols-7 gap-2 mb-2">
                            <div class="calendar-day-header text-xs sm:text-base">Sun</div><div class="calendar-day-header text-xs sm:text-base">Mon</div><div class="calendar-day-header text-xs sm:text-base">Tue</div><div class="calendar-day-header text-xs sm:text-base">Wed</div><div class="calendar-day-header text-xs sm:text-base">Thu</div><div class="calendar-day-header text-xs sm:text-base">Fri</div><div class="calendar-day-header text-xs sm:text-base">Sat</div>
                        </div>
                        <div id="calendar-grid" class="calendar-grid"></div>
                    </div>
                </div>
                
                <div id="reports-view" class="dashboard-view" data-intro="The Reports section visualizes your attendance trends over time." data-step="7">
                     <div class="flex justify-between items-center mb-8 flex-wrap gap-4">
                        <h1 class="text-2xl sm:text-3xl font-bold text-white">Reports & Insights</h1>
                        <div class="flex flex-col sm:flex-row gap-4">
                            <select id="reports-filter" class="form-input w-32 px-3 py-2 text-sm" aria-label="Report filter period">
                                <option value="term">Current Term</option>
                                <option value="month">Last 30 Days</option>
                                <option value="week">Last 7 Days</option>
                                <option value="cumulative">Cumulative</option>
                            </select>
                            <button id="semester-wrapped-btn" class="bg-purple-500/80 text-white font-semibold py-2 px-5 rounded-lg hover:bg-purple-500/100 transition-colors" aria-label="Generate semester summary">Semester Wrapped</button>
                            <button id="export-csv-btn" class="btn-primary text-white font-semibold py-2 px-5 rounded-lg" aria-label="Export history to CSV">Export Full History (CSV)</button>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="subject-chart-container">
                    </div>
                    <div class="card rounded-xl p-6 mt-8 no-hover">
                        <h3 class="text-xl font-bold text-white mb-4">Overall Attendance Trend</h3>
                        <canvas id="trends-chart"></canvas>
                    </div>
                </div>

                <div id="achievements-view" class="dashboard-view" data-intro="Achievements give you motivational goals to keep your attendance high!" data-step="6">
                    <h1 class="text-2xl sm:text-3xl font-bold text-white mb-8">My Achievements</h1>
                    <div id="achievements-grid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"></div>
                </div>

                <div id="gpa-view" class="dashboard-view" data-intro="Use the GPA calculator to track estimated or final grades and your credit average." data-step="8">
                    <div class="flex flex-wrap justify-between items-center gap-4 mb-8">
                        <div class="flex-grow">
                             <h1 class="text-2xl sm:text-3xl font-bold text-white">GPA Calculator</h1>
                             <p class="text-gray-400">Track your grades and calculate your GPA.</p>
                        </div>
                         <div class="flex items-center gap-4 w-full sm:w-auto">
                             <input type="search" id="gpa-search" placeholder="Search courses..." class="search-input w-full sm:w-auto flex-grow px-4 py-2 rounded-lg text-white" aria-label="Search GPA courses">
                            <button id="add-gpa-course-btn" class="btn-primary text-white font-semibold py-2 px-5 rounded-lg flex-shrink-0" aria-label="Add GPA course">Add Course</button>
                        </div>
                    </div>
                    <div class="card rounded-xl p-6 no-hover">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div class="p-4 bg-white/5 rounded-lg text-center">
                                <h4 class="text-gray-400">Total Credits</h4>
                                <p id="gpa-total-credits" class="text-3xl font-bold text-white mt-1">0</p>
                            </div>
                            <div class="p-4 bg-white/5 rounded-lg text-center">
                                <h4 class="text-gray-400">Current GPA</h4>
                                <p id="gpa-current-gpa" class="text-3xl font-bold text-green-400">0.00</p>
                            </div>
                            <div class="p-4 bg-white/5 rounded-lg text-center">
                                <h4 class="text-gray-400">Total Courses</h4>
                                <p id="gpa-total-courses" class="text-3xl font-bold text-white mt-1">0</p>
                            </div>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left min-w-[400px]">
                                <thead>
                                    <tr class="border-b border-white/10">
                                        <th class="p-4">Course Name</th>
                                        <th class="p-4 text-center">Credits</th>
                                        <th class="p-4 text-center">Final Grade</th>
                                        <th class="p-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="gpa-courses-tbody">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div id="profile-view" class="dashboard-view" data-intro="Check your personal details and app status in the Profile view." data-step="9">
                    <h1 class="text-2xl sm:text-3xl font-bold text-white mb-8">My Professional Profile</h1>
                    <div class="card max-w-4xl mx-auto p-6 sm:p-8 rounded-xl no-hover">
                         <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                             <div class="lg:col-span-1 border-r lg:border-r-white/10 pr-8">
                                <div class="flex flex-col items-center text-center space-y-4 mb-6">
                                    <img id="profile-img" class="h-32 w-32 rounded-full object-cover border-4 border-blue-500 shadow-xl" 
                                         src="https://placehold.co/128x128/3b82f6/FFFFFF?text=A" alt="Profile picture" loading="lazy">
                                    <div class="flex flex-col items-center">
                                        <h2 id="profile-name-display" class="text-2xl font-bold text-white">User Name</h2>
                                        <p id="profile-email" class="text-md text-gray-400 break-all">your.contact@example.com</p>
                                        <p id="profile-status-tier" class="text-sm px-3 py-1 mt-1 rounded-full font-semibold bg-green-500/20 text-green-400">Attendance Tier: High Performer</p>
                                    </div>
                                </div>
                                <div class="space-y-4 text-center pt-4 border-t border-white/10">
                                    <p class="text-lg font-medium">Student Info</p>
                                    <div class="hidden">
                                        <label class="text-sm text-gray-400 block">Roll Number (Removed)</label>
                                        <p id="profile-roll" class="text-white font-semibold">Not set</p>
                                    </div>
                                    <div>
                                        <label class="text-sm text-gray-400 block">Mobile Number/Email</label>
                                        <p id="profile-mobile" class="text-white font-semibold">Not set</p>
                                    </div>
                                    <button id="edit-profile-btn" class="bg-white/10 text-white font-semibold py-2 px-6 rounded-lg border border-white/20 hover:bg-white/20 transition-colors inline-flex items-center gap-2">
                                         <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
                                        Edit Details
                                    </button>
                                </div>
                             </div>

                             <div class="lg:col-span-2 space-y-6">
                                <h3 class="text-xl font-bold text-white border-b border-white/10 pb-2">Academic Overview</h3>
                                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                     <div class="profile-stat-card">
                                        <p class="text-sm text-gray-400">Total Credits Logged</p>
                                        <p id="profile-total-credits" class="text-2xl font-bold text-white mt-1">0</p>
                                     </div>
                                     <div class="profile-stat-card">
                                        <p class="text-sm text-gray-400">Academic Year</p>
                                        <p id="profile-year" class="text-2xl font-bold text-white mt-1">Not set</p>
                                     </div>
                                     <div class="profile-stat-card">
                                        <p class="text-sm text-gray-400">Current Course</p>
                                        <p id="profile-course" class="text-2xl font-bold text-white mt-1">Not set</p>
                                     </div>
                                </div>
                                
                                <h3 class="text-xl font-bold text-white border-b border-white/10 pb-2 mt-6">Performance Metrics</h3>
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="profile-stat-card">
                                        <p class="text-sm text-gray-400">Overall Attendance</p>
                                        <p id="profile-overall-attendance" class="text-2xl font-bold text-green-400 mt-1">-%</p>
                                        <div class="flex justify-between items-center mt-2 text-xs text-gray-400">
                                            <span>Classes: <span id="profile-total-classes" class="font-bold text-white">0</span></span>
                                            <span class="text-green-400">P: <span id="profile-total-present" class="font-bold">0</span></span>
                                            <span class="text-red-400">A: <span id="profile-total-absent" class="font-bold">0</span></span>
                                        </div>
                                        <div class="w-full bg-gray-700/30 rounded-full h-2 mt-3">
                                            <div id="profile-attendance-bar" class="h-2 rounded-full" style="width: 0%; background-color: var(--primary-color-start);"></div>
                                        </div>
                                    </div>
                                    <div class="profile-stat-card">
                                        <p class="text-sm text-gray-400">Calculated GPA</p>
                                        <p id="profile-calculated-gpa" class="text-2xl font-bold text-yellow-400 mt-1">0.00</p>
                                        <p class="text-xs text-gray-400 mt-1">Based on final grades added.</p>
                                    </div>
                                </div>

                                <h3 class="text-xl font-bold text-white border-b border-white/10 pb-2 mt-6">Achievement Summary</h3>
                                <div class="profile-stat-card">
                                     <p class="text-sm text-gray-400">Total Badges Unlocked</p>
                                     <p id="profile-achievements-unlocked" class="text-2xl font-bold text-purple-400 mt-1">0 / 20</p>
                                </div>
                             </div>
                         </div>
                    </div>
                </div>

            </main>
        </div>
    </div>
`;
