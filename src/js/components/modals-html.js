export const modalsHtml = `
    <div id="confirmation-modal" class="modal-overlay fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 opacity-0 pointer-events-none">
        <div class="modal-content card max-w-md w-full p-6 sm:p-8 rounded-2xl transform scale-95 no-hover">
            <h2 id="confirmation-title" class="text-2xl font-bold text-white mb-4">Are you sure?</h2>
            <p id="confirmation-message" class="text-gray-300 mb-6">This action cannot be undone.</p>
            <div class="flex justify-end gap-4">
                <button type="button" class="close-modal-btn bg-white/10 text-white font-semibold py-2 px-6 rounded-lg border border-white/20 hover:bg-white/20" aria-label="Cancel">Cancel</button>
                <button type="button" id="confirm-action-btn" class="btn-danger text-white font-bold py-2 px-6 rounded-lg" aria-label="Confirm Action">Confirm</button>
            </div>
        </div>
    </div>
    
    <div id="edit-attendance-modal" class="modal-overlay fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 opacity-0 pointer-events-none">
        <div class="modal-content card max-w-md w-full p-6 sm:p-8 rounded-2xl transform scale-95 no-hover">
            <h2 id="edit-attendance-title" class="text-2xl font-bold text-white mb-4">Edit Attendance for [Course]</h2>
            
            <div class="mb-6">
                <label for="absent-reason" class="block mb-2 text-sm font-medium text-gray-300">Reason (if Absent/Cancelled)</label>
                <select id="absent-reason" class="form-input" aria-label="Reason for absence or cancellation">
                    <option value="">Select Reason (Optional)</option>
                    <option value="SICK">SICK</option>
                    <option value="HOLIDAY">HOLIDAY</option>
                    <option value="OFFICIAL">OFFICIAL Work/Duty</option>
                    <option value="PERSONAL">PERSONAL Day/Other</option>
                </select>
            </div>

            <p id="edit-attendance-message" class="text-gray-300 mb-6">Change the status of this class:</p>
            <div class="flex justify-center gap-4">
            </div>
            <div class="flex justify-end gap-4 mt-6">
                 <button type="button" class="close-modal-btn bg-white/10 text-white font-semibold py-2 px-6 rounded-lg border border-white/20 hover:bg-white/20" aria-label="Close modal">Close</button>
            </div>
        </div>
    </div>

    <div id="class-modal" class="modal-overlay fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 opacity-0 pointer-events-none">
        <div class="modal-content card max-w-md w-full p-6 sm:p-8 rounded-2xl transform scale-95 no-hover">
            <h2 id="class-modal-title" class="text-2xl font-bold text-white mb-6">Add a New Class</h2>
            <form id="class-form" novalidate>
                <input type="hidden" id="editing-class-id">
                <div class="mb-4">
                    <label for="course-name" class="block mb-2 text-sm font-medium text-gray-300">Course/Lab Name</label>
                    <input type="text" id="course-name" class="form-input" required>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label for="instructor-name" class="block mb-2 text-sm font-medium text-gray-300">Instructor Name</label>
                        <input type="text" id="instructor-name" class="form-input" placeholder="e.g., Dr. Smith">
                    </div>
                    <div>
                         <label for="room-number" class="block mb-2 text-sm font-medium text-gray-300">Room/Building</label>
                        <input type="text" id="room-number" class="form-input" placeholder="e.g., A201">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label for="day-of-week" class="block mb-2 text-sm font-medium text-gray-300">Day</label>
                        <select id="day-of-week" class="form-input" required>
                            <option value="Monday">Monday</option><option value="Tuesday">Tuesday</option><option value="Wednesday">Wednesday</option><option value="Thursday">Thursday</option><option value="Friday">Friday</option><option value="Saturday">Saturday</option><option value="Sunday">Sunday</option>
                        </select>
                    </div>
                    <div>
                         <label for="course-type" class="block mb-2 text-sm font-medium text-gray-300">Type</label>
                        <select id="course-type" class="form-input" required>
                            <option value="Class">Class</option><option value="Lab">Lab</option><option value="Class & Lab">Class & Lab</option>
                        </select>
                    </div>
                </div>
                 <div class="mb-6 relative">
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label for="start-time" class="block mb-2 text-sm font-medium text-gray-300">Start Time</label>
                            <input type="time" id="start-time" class="form-input" required>
                        </div>
                        <div>
                            <label for="end-time" class="block mb-2 text-sm font-medium text-gray-300">End Time</label>
                            <input type="time" id="end-time" class="form-input" required>
                        </div>
                    </div>
                    <div id="duration-feedback" class="text-sm text-center font-semibold text-blue-400 mb-2">Duration: 0 minutes</div>
                    <div class="flex items-center gap-4">
                        <span class="text-sm text-gray-400">or set duration:</span>
                        <select id="duration-preset" class="form-input p-2 text-sm w-32" aria-label="Class duration preset">
                            <option value="0">Custom</option>
                            <option value="60">1 Hour</option>
                            <option value="90">1.5 Hours</option>
                            <option value="50">50 Minutes</option>
                            <option value="120">2 Hours</option>
                        </select>
                    </div>
                    <div id="time-validation-error" class="form-error absolute -bottom-5 left-0 right-0 text-center hidden">End time must be after start time.</div>
                </div>
                <div class="flex justify-end gap-4 pt-4">
                    <button type="button" class="close-modal-btn bg-white/10 text-white font-semibold py-2 px-6 rounded-lg border border-white/20 hover:bg-white/20" aria-label="Cancel">Cancel</button>
                    <button type="submit" class="btn-primary text-white font-bold py-2 px-6 rounded-lg" aria-label="Save class">Save</button>
                </div>
            </form>
        </div>
    </div>
    
    <div id="course-details-modal" class="modal-overlay fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 opacity-0 pointer-events-none">
        <div class="modal-content card max-w-3xl w-full p-6 sm:p-8 rounded-2xl transform scale-95 no-hover">
            <div class="flex justify-between items-start">
                <h2 id="course-details-title" class="text-3xl font-bold text-white mb-6">Course Details</h2>
                <button class="close-modal-btn text-gray-400 hover:text-white text-3xl" aria-label="Close modal">&times;</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div>
                     <h3 class="text-lg font-bold text-white mb-2">Bunk Planner & "What If?"</h3>
                    <div class="flex items-baseline gap-4 mb-4">
                        <label for="attendance-goal" class="text-gray-300">My Goal:</label>
                        <input type="number" id="attendance-goal" value="75" min="1" max="100" class="form-input w-20 text-center p-1" aria-label="Attendance goal percentage">%
                    </div>
                    <div id="bunk-planner-output" class="p-4 bg-white/5 rounded-lg text-center mb-4"></div>
                    
                    <div class="flex items-center gap-2">
                        <span>What if I miss the next</span>
                        <input type="number" id="what-if-input" min="0" class="form-input w-16 text-center p-1" aria-label="Number of future classes to miss">
                        <span>classes?</span>
                    </div>
                    <p id="what-if-output" class="text-center font-bold text-lg mt-2"></p>

                </div>
                <div>
                    <h3 class="text-lg font-bold text-white mb-2">Attendance Log</h3>
                    <div id="course-log-container" class="max-h-60 overflow-y-auto pr-2"></div>
                </div>
            </div>
        </div>
    </div>
    
    <div id="settings-modal" class="modal-overlay fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 opacity-0 pointer-events-none">
        <div class="modal-content card max-w-3xl w-full p-0 rounded-2xl transform scale-95 no-hover overflow-hidden flex flex-col md:flex-row h-[85vh] max-h-[700px]">
            <!-- Sidebar for Settings Tabs -->
            <div class="w-full md:w-1/3 bg-black/40 border-r border-white/5 flex flex-col">
                <div class="p-6 border-b border-white/5 flex justify-between items-center md:block">
                    <h2 class="text-xl font-bold text-white">Settings</h2>
                    <button class="close-modal-btn text-gray-400 hover:text-white text-2xl md:hidden" aria-label="Close settings">&times;</button>
                </div>
                <div class="flex-1 overflow-y-auto p-4 space-y-2">
                    <button class="settings-tab-btn active w-full text-left px-4 py-3 rounded-xl text-white font-medium bg-white/10 hover:bg-white/10 transition-colors flex items-center gap-3" data-tab="settings-general">
                        <svg class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg> General
                    </button>
                    <button class="settings-tab-btn w-full text-left px-4 py-3 rounded-xl text-gray-400 font-medium hover:bg-white/5 transition-colors flex items-center gap-3" data-tab="settings-terms">
                        <svg class="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> Terms & Semesters
                    </button>
                    <button class="settings-tab-btn w-full text-left px-4 py-3 rounded-xl text-gray-400 font-medium hover:bg-white/5 transition-colors flex items-center gap-3" data-tab="settings-advanced">
                        <svg class="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg> Advanced
                    </button>
                </div>
            </div>

            <!-- Settings Content Area -->
            <div class="flex-1 p-6 md:p-10 overflow-y-auto relative custom-scrollbar">
                 <button class="close-modal-btn absolute top-6 right-6 text-gray-400 hover:text-white text-3xl hidden md:block" aria-label="Close settings">&times;</button>
                 
                 <!-- General Tab -->
                 <div id="settings-general" class="settings-tab-content active space-y-8 animate-fade-in">
                     <div>
                         <h3 class="text-xl font-bold text-white mb-2">Appearance</h3>
                         <p class="text-sm text-gray-400 mb-6">Customize how Attendora looks on your device.</p>
                         
                         <div class="bg-white/5 rounded-2xl border border-white/5 divide-y divide-white/5">
                             <div class="p-6 flex items-center justify-between">
                                 <div class="pr-4">
                                     <span class="block font-medium text-white mb-1">Theme Accent</span>
                                     <span class="text-xs text-gray-400">Choose your favorite primary color.</span>
                                 </div>
                                 <div id="theme-picker" class="flex flex-wrap gap-2 justify-end"></div>
                             </div>
                             <div class="p-6 flex items-center justify-between">
                                 <div>
                                     <span class="block font-medium text-white mb-1">Light Mode</span>
                                     <span class="text-xs text-gray-400">Switch to a lighter color scheme.</span>
                                 </div>
                                 <div class="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
                                     <input type="checkbox" name="toggle-theme" id="theme-toggle" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" aria-label="Toggle light mode"/>
                                     <label for="theme-toggle" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-600 cursor-pointer"></label>
                                 </div>
                             </div>
                         </div>
                     </div>
                     
                     <div>
                         <h3 class="text-xl font-bold text-white mb-2">Notifications</h3>
                         <div class="bg-white/5 rounded-2xl border border-white/5 p-6">
                             <div class="flex items-center justify-between">
                                 <div class="pr-4">
                                     <span class="block font-medium text-white mb-1">Push Notifications</span>
                                     <span id="notification-status-text" class="text-xs text-gray-400">Get Web Push reminders before classes start.</span>
                                 </div>
                                 <div class="relative inline-block w-12 align-middle select-none transition duration-200 ease-in flex-shrink-0">
                                     <input type="checkbox" name="toggle-notifications" id="notification-toggle" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" aria-label="Toggle class reminders"/>
                                     <label for="notification-toggle" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-600 cursor-pointer"></label>
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>

                 <!-- Terms Tab -->
                 <div id="settings-terms" class="settings-tab-content hidden space-y-8 animate-fade-in">
                     <div>
                         <h3 class="text-xl font-bold text-white mb-2">Term Management</h3>
                         <p class="text-sm text-gray-400 mb-6">Manage the duration of your current academic term.</p>
                         
                         <div class="bg-white/5 rounded-2xl border border-white/5 p-6">
                             <div class="flex items-center justify-between mb-6">
                                 <span class="font-medium text-white">Current Term Dates</span>
                                 <span id="current-term-dates" class="text-xs font-bold text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-lg border border-blue-400/20">N/A</span>
                             </div>
                             
                             <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                 <div>
                                     <label for="term-start-date" class="block mb-2 text-sm font-medium text-gray-300">Start Date</label>
                                     <input type="date" id="term-start-date" class="form-input bg-black/40 border border-white/10 p-3 text-sm rounded-xl text-white focus:border-blue-500" aria-label="Term Start Date">
                                 </div>
                                 <div>
                                     <label for="term-end-date" class="block mb-2 text-sm font-medium text-gray-300">End Date</label>
                                     <input type="date" id="term-end-date" class="form-input bg-black/40 border border-white/10 p-3 text-sm rounded-xl text-white focus:border-blue-500" aria-label="Term End Date">
                                 </div>
                             </div>
                             <button id="save-term-dates-btn" class="w-full bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 font-semibold py-3 rounded-xl transition-colors border border-blue-500/30 text-sm" aria-label="Save term dates">Save Dates</button>
                         </div>
                     </div>
                     
                     <div>
                         <h3 class="text-xl font-bold text-white mb-2">Archived Terms</h3>
                         <div class="bg-white/5 rounded-2xl border border-white/5 p-6">
                             <div class="flex items-center justify-between mb-4">
                                 <span class="font-medium text-white">Previous Records</span>
                                 <span class="text-xs font-bold text-gray-400 bg-gray-400/10 px-3 py-1.5 rounded-lg border border-gray-400/20"><span id="archived-count">0</span> saved</span>
                             </div>
                             <button id="view-archived-terms-btn" class="w-full text-center text-sm font-medium text-blue-400 hover:text-blue-300 py-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5" aria-label="View archived terms">View Archives</button>
                             <div id="archived-terms-list" class="mt-4 space-y-2 max-h-48 overflow-y-auto hidden custom-scrollbar pr-2"></div>
                         </div>
                     </div>
                 </div>

                 <!-- Advanced Tab -->
                 <div id="settings-advanced" class="settings-tab-content hidden space-y-8 animate-fade-in">
                     <div>
                         <h3 class="text-xl font-bold text-white mb-2">Data Backup</h3>
                         <p class="text-sm text-gray-400 mb-6">Import or export your Attendora data locally.</p>
                         
                         <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <button id="export-data-btn" class="flex flex-col items-center justify-center p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors gap-3" aria-label="Export all data">
                                 <div class="p-3 bg-green-500/20 rounded-full border border-green-500/30">
                                     <svg class="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                                 </div>
                                 <div class="text-center">
                                     <span class="block font-medium text-white">Export Backup</span>
                                     <span class="text-xs text-gray-400 mt-1">Download as .json</span>
                                 </div>
                             </button>
                             
                             <label for="import-data-input" class="flex flex-col items-center justify-center p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer gap-3" aria-label="Import data">
                                 <div class="p-3 bg-blue-500/20 rounded-full border border-blue-500/30">
                                     <svg class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                                 </div>
                                 <div class="text-center">
                                     <span class="block font-medium text-white">Import Backup</span>
                                     <span class="text-xs text-gray-400 mt-1">Restore from .json</span>
                                 </div>
                             </label>
                             <input type="file" id="import-data-input" class="hidden" accept=".json">
                         </div>
                     </div>

                     <div class="pt-4">
                         <h3 class="text-xl font-bold text-red-400 mb-2">Danger Zone</h3>
                         <div class="bg-red-500/10 rounded-2xl border border-red-500/20 p-6 relative overflow-hidden">

                             <p class="text-sm text-red-300 mb-6 relative z-10">Actions here are permanent and will affect your current progress.</p>
                             <button id="archive-term-btn-danger" class="w-full bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 font-semibold py-3.5 rounded-xl transition-colors relative z-10 shadow-lg" aria-label="Archive current term">Archive Current Term & Start New</button>
                         </div>
                     </div>
                 </div>
            </div>
        </div>
    </div>
    
    <div id="notes-modal" class="modal-overlay fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 opacity-0 pointer-events-none">
        <div class="modal-content card max-w-md w-full p-6 sm:p-8 rounded-2xl transform scale-95 no-hover">
            <h2 class="text-2xl font-bold text-white mb-6">Attendance Note</h2>
            <form id="notes-form">
                <input type="hidden" id="note-history-id">
                <textarea id="note-textarea" rows="4" class="form-input" placeholder="e.g., Missed class, get notes from Priya..." aria-label="Note details"></textarea>
                <div class="flex justify-end gap-4 mt-6">
                    <button type="button" class="close-modal-btn bg-white/10 text-white font-semibold py-2 px-6 rounded-lg border border-white/20 hover:bg-white/20" aria-label="Cancel">Cancel</button>
                    <button type="submit" class="btn-primary text-white font-bold py-2 px-6 rounded-lg" aria-label="Save note">Save Note</button>
                </div>
            </form>
        </div>
    </div>
    
    <div id="assignment-modal" class="modal-overlay fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 opacity-0 pointer-events-none">
        <div class="modal-content card max-w-md w-full p-6 sm:p-8 rounded-2xl transform scale-95 no-hover">
            <h2 id="assignment-modal-title" class="text-2xl font-bold text-white mb-6">Add New Assignment</h2>
            <form id="assignment-form">
                <input type="hidden" id="editing-assignment-id">
                <div class="mb-4">
                    <label for="assignment-title" class="block mb-2 text-sm font-medium text-gray-300">Title</label>
                    <input type="text" id="assignment-title" class="form-input" required>
                </div>
                 <div class="mb-4">
                    <label for="assignment-course" class="block mb-2 text-sm font-medium text-gray-300">Course</label>
                    <select id="assignment-course" class="form-input" required aria-label="Assignment Course"></select>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label for="assignment-type" class="block mb-2 text-sm font-medium text-gray-300">Type</label>
                        <select id="assignment-type" class="form-input" required aria-label="Assignment Type">
                            <option value="Assignment">Assignment</option>
                            <option value="Exam">Exam</option>
                            <option value="Quiz">Quiz</option>
                            <option value="Project">Project</option>
                        </select>
                    </div>
                    <div>
                         <label for="assignment-due-date" class="block mb-2 text-sm font-medium text-gray-300">Due Date</label>
                         <input type="date" id="assignment-due-date" class="form-input" required aria-label="Assignment Due Date">
                    </div>
                </div>
                <div class="flex justify-end gap-4">
                    <button type="button" class="close-modal-btn bg-white/10 text-white font-semibold py-2 px-6 rounded-lg border border-white/20 hover:bg-white/20" aria-label="Cancel">Cancel</button>
                    <button type="submit" class="btn-primary text-white font-bold py-2 px-6 rounded-lg" aria-label="Save assignment">Save</button>
                </div>
            </form>
        </div>
    </div>
    
    <div id="gpa-modal" class="modal-overlay fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 opacity-0 pointer-events-none">
        <div class="modal-content card max-w-md w-full p-6 sm:p-8 rounded-2xl transform scale-95 no-hover">
            <h2 id="gpa-modal-title" class="text-2xl font-bold text-white mb-6">Add Course for GPA</h2>
            <form id="gpa-form">
                <input type="hidden" id="editing-gpa-id">
                <div class="mb-4">
                    <label for="gpa-course-name" class="block mb-2 text-sm font-medium text-gray-300">Course Name</label>
                    <input type="text" id="gpa-course-name" class="form-input" required>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label for="gpa-credits" class="block mb-2 text-sm font-medium text-gray-300">Credits</label>
                        <input type="number" id="gpa-credits" min="0" step="0.5" class="form-input" required>
                    </div>
                    <div>
                        <label for="gpa-grade" class="block mb-2 text-sm font-medium text-gray-300">Final Grade (Points)</label>
                        <select id="gpa-grade" class="form-input" required aria-label="Final Grade Points">
                            <option value="10">O (90-100 Marks) - 10</option>
                            <option value="9">A+ (75-89 Marks) - 9</option>
                            <option value="8">A (65-74 Marks) - 8</option>
                            <option value="7">B+ (55-64 Marks) - 7</option>
                            <option value="6">B (50-54 Marks) - 6</option>
                            <option value="5">C (45-49 Marks) - 5</option>
                            <option value="4">P (40-44 Marks) - 4</option>
                            <option value="0">F (Less than 40) - 0</option>
                        </select>
                    </div>
                </div>
                <div class="mb-4 border-t border-white/10 pt-4">
                    <label for="gpa-estimated-percent" class="block mb-2 text-sm font-medium text-gray-300">Estimated Percentage Grade (for progress tracking)</label>
                    <div class="flex items-center gap-2">
                        <input type="number" id="gpa-estimated-percent" min="0" max="100" class="form-input" placeholder="e.g., 85" aria-label="Estimated Percentage Grade">
                        <span class="text-lg font-bold text-gray-400">%</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">Simulates grade component weighting (e.g., 20% mid-term, 40% final). Enter the current overall percentage.</p>
                </div>
                <div class="flex justify-end gap-4">
                    <button type="button" class="close-modal-btn bg-white/10 text-white font-semibold py-2 px-6 rounded-lg border border-white/20 hover:bg-white/20" aria-label="Cancel">Cancel</button>
                    <button type="submit" class="btn-primary text-white font-bold py-2 px-6 rounded-lg" aria-label="Save GPA course">Save</button>
                </div>
            </form>
        </div>
    </div>

    <div id="semester-wrapped-modal" class="modal-overlay fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 opacity-0 pointer-events-none">
        <div class="modal-content card max-w-lg w-full p-6 sm:p-8 rounded-2xl transform scale-95 no-hover">
            <div class="text-center mb-6">
                <h2 class="text-4xl font-bold text-white font-brand">Your Semester Wrapped!</h2>
                <p class="text-gray-400">A summary of your academic journey.</p>
            </div>
            <div id="wrapped-content" class="space-y-4 text-white max-h-80 overflow-y-auto pr-4">
            </div>
            <div class="flex justify-end gap-4 mt-8">
                <button type="button" class="close-modal-btn bg-white/10 text-white font-semibold py-2 px-6 rounded-lg border border-white/20 hover:bg-white/20" aria-label="Close modal">Close</button>
                <button type="button" id="share-wrapped-btn" class="btn-primary text-white font-bold py-2 px-6 rounded-lg" aria-label="Share summary">Share</button>
            </div>
        </div>
    </div>

    <div id="scan-timetable-modal" class="modal-overlay fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 opacity-0 pointer-events-none">
        <div class="modal-content card max-w-4xl w-full p-6 sm:p-8 rounded-2xl transform scale-95 no-hover">
            <div id="scan-upload-view">
                <h2 class="text-2xl font-bold text-white mb-4">Scan Your Timetable</h2>
                <p class="text-gray-400 mb-6">Upload a picture of your weekly schedule. We'll use AI to read it and set up your classes automatically.</p>
                <div class="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center">
                    <svg class="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                    <label for="timetable-file-input" class="relative cursor-pointer mt-4 font-semibold text-blue-400 hover:text-blue-300">
                        <span>Upload a file</span>
                        <input id="timetable-file-input" name="timetable-file-input" type="file" class="sr-only" accept="image/*">
                    </label>
                    <p class="text-xs text-gray-500 mt-1">PNG, JPG, or GIF up to 10MB.</p>
                </div>
                 <div class="flex justify-end mt-6">
                    <button type="button" id="scan-cancel-btn" class="close-modal-btn bg-white/10 text-white font-semibold py-2 px-6 rounded-lg border border-white/20 hover:bg-white/20" aria-label="Cancel">Cancel</button>
                </div>
            </div>
            <div id="scan-processing-view" class="hidden text-center">
                 <h2 class="text-2xl font-bold text-white mb-4">Scanning Timetable...</h2>
                 <p class="text-gray-400">AI is reading your schedule. This might take a moment.</p>
                 <div class="mt-8">
                     <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto"></div>
                 </div>
            </div>
            <div id="scan-correction-view" class="hidden">
                 <h2 class="text-2xl font-bold text-white mb-2">Review & Correct</h2>
                 <p class="text-gray-400 mb-6">We've scanned your timetable. Please review the entries below and correct any errors before saving.</p>
                 <div id="correction-grid-container" class="max-h-96 overflow-y-auto pr-2">
                 </div>
                 <div class="flex justify-end gap-4 mt-8">
                    <button type="button" id="scan-cancel-btn-2" class="close-modal-btn bg-white/10 text-white font-semibold py-2 px-6 rounded-lg border border-white/20 hover:bg-white/20" aria-label="Cancel">Cancel</button>
                    <button type="button" id="save-scanned-schedule-btn" class="btn-primary text-white font-bold py-2 px-6 rounded-lg" aria-label="Save scanned schedule">Save Schedule</button>
                </div>
            </div>
        </div>
    </div>
    <div id="calendar-day-details-modal" class="modal-overlay fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 opacity-0 pointer-events-none">
        <div class="modal-content card max-w-md w-full p-6 sm:p-8 rounded-2xl transform scale-95 no-hover">
            <div class="flex justify-between items-start mb-4">
                <h2 id="calendar-day-title" class="text-2xl font-bold text-white">Attendance Detail</h2>
                <button class="close-modal-btn text-gray-400 hover:text-white text-3xl" aria-label="Close modal">&times;</button>
            </div>
            <div id="calendar-day-log" class="space-y-3 max-h-80 overflow-y-auto pr-2">
                <!-- Log entries will be injected here -->
            </div>
            <div class="flex justify-end mt-6">
                 <button type="button" class="close-modal-btn bg-white/10 text-white font-semibold py-2 px-6 rounded-lg border border-white/20 hover:bg-white/20" aria-label="Close">Close</button>
            </div>
        </div>
    </div>

    <div id="profile-modal" class="modal-overlay fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 opacity-0 pointer-events-none">
        <div class="modal-content card max-w-3xl w-full p-0 rounded-2xl transform scale-95 no-hover overflow-hidden flex flex-col md:flex-row h-[85vh] max-h-[700px]">
            <!-- Sidebar for Profile Tabs -->
            <div class="w-full md:w-1/3 bg-black/40 border-r border-white/5 flex flex-col">
                <div class="p-6 border-b border-white/5 flex justify-between items-center md:block">
                    <h2 class="text-xl font-bold text-white">My Profile</h2>
                    <button class="close-modal-btn text-gray-400 hover:text-white text-2xl md:hidden" aria-label="Close profile">&times;</button>
                </div>
                <div class="flex-1 overflow-y-auto p-4 space-y-2">
                    <button class="profile-tab-btn active w-full text-left px-4 py-3 rounded-xl text-white font-medium bg-white/10 hover:bg-white/10 transition-colors flex items-center gap-3" data-tab="profile-overview">
                        <svg class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Overview
                    </button>
                    <button class="profile-tab-btn w-full text-left px-4 py-3 rounded-xl text-gray-400 font-medium hover:bg-white/5 transition-colors flex items-center gap-3" data-tab="profile-personal">
                        <svg class="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> Personal Info
                    </button>
                    <button class="profile-tab-btn w-full text-left px-4 py-3 rounded-xl text-gray-400 font-medium hover:bg-white/5 transition-colors flex items-center gap-3" data-tab="profile-achievements">
                        <svg class="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg> Achievements
                    </button>
                </div>
            </div>

            <!-- Profile Content Area -->
            <div class="flex-1 p-6 md:p-10 overflow-y-auto relative custom-scrollbar">
                 <button class="close-modal-btn absolute top-6 right-6 text-gray-400 hover:text-white text-3xl hidden md:block" aria-label="Close profile">&times;</button>
                 
                 <!-- Overview Tab -->
                 <div id="profile-overview" class="profile-tab-content active space-y-8 animate-fade-in">
                     <div>
                         <h3 class="text-xl font-bold text-white mb-2">Academic Overview</h3>
                         <p class="text-sm text-gray-400 mb-6">Your current standing and enrolled course details.</p>
                         
                         <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                             <div class="bg-white/5 rounded-2xl border border-white/5 p-5">
                                 <p class="text-sm font-medium text-gray-400 mb-1">Current Course</p>
                                 <p id="profile-course" class="text-xl font-bold text-white">Not set</p>
                             </div>
                             <div class="bg-white/5 rounded-2xl border border-white/5 p-5">
                                 <p class="text-sm font-medium text-gray-400 mb-1">Academic Year</p>
                                 <p id="profile-year" class="text-xl font-bold text-white">Not set</p>
                             </div>
                             <div class="bg-white/5 rounded-2xl border border-white/5 p-5 sm:col-span-2">
                                 <p class="text-sm font-medium text-gray-400 mb-1">Total Credits Logged</p>
                                 <p id="profile-total-credits" class="text-xl font-bold text-white">0</p>
                             </div>
                         </div>
                     </div>
                     
                     <div>
                         <h3 class="text-xl font-bold text-white mb-4">Performance Metrics</h3>
                         <div class="space-y-4">
                             <!-- Overall Attendance -->
                             <div class="bg-black/20 rounded-2xl p-6 border border-white/5 flex flex-col justify-center relative overflow-hidden">
                                  <div class="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                  <h3 class="text-sm font-medium text-gray-400 mb-1">Overall Attendance</h3>
                                  <p id="profile-overall-attendance" class="text-4xl font-black text-green-400 mb-3">-%</p>
                                  <div class="w-full bg-gray-800 rounded-full h-1.5 mb-3">
                                       <div id="profile-attendance-bar" class="h-1.5 rounded-full" style="width: 0%; background-color: var(--primary-color-start);"></div>
                                  </div>
                                  <div class="flex justify-between text-xs font-medium">
                                       <span class="text-gray-400">Total: <span id="profile-total-classes" class="text-white">0</span></span>
                                       <span class="text-green-400">P: <span id="profile-total-present">0</span></span>
                                       <span class="text-red-400">A: <span id="profile-total-absent">0</span></span>
                                  </div>
                             </div>
                             
                             <!-- Calculated GPA -->
                             <div class="bg-black/20 rounded-2xl p-6 border border-white/5 flex flex-col justify-center relative overflow-hidden">
                                  <div class="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                  <h3 class="text-sm font-medium text-gray-400 mb-1">Calculated GPA</h3>
                                  <p id="profile-calculated-gpa" class="text-4xl font-black text-yellow-400 mb-3">0.00</p>
                                  <p class="text-xs text-gray-500 mt-auto">Based on final grades added in the GPA Calculator.</p>
                             </div>
                         </div>
                     </div>
                 </div>

                 <!-- Personal Info Tab -->
                 <div id="profile-personal" class="profile-tab-content hidden space-y-8 animate-fade-in">
                     <div class="flex flex-col items-center text-center space-y-6 pt-4">
                         <div class="relative">
                             <img id="profile-img" class="h-32 w-32 rounded-full object-cover border-4 border-white/10 shadow-xl" src="https://placehold.co/128x128/3b82f6/FFFFFF?text=A" alt="Profile picture" loading="lazy">
                         </div>
                         <div>
                             <h2 id="profile-name-display" class="text-3xl font-bold text-white mb-2">User Name</h2>
                             <p id="profile-email" class="text-sm text-gray-400 mb-4">your.contact@example.com</p>
                             <p id="profile-status-tier" class="inline-block px-3 py-1 mt-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">Attendance Tier: High Performer</p>
                         </div>
                     </div>
                     
                     <div class="bg-white/5 rounded-2xl border border-white/5 p-6 mt-8">
                         <div class="flex items-center justify-between mb-4">
                             <h3 class="font-medium text-white">Contact Info</h3>
                             <button id="edit-profile-btn" class="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg> Edit Details
                             </button>
                         </div>
                         <div class="space-y-4">
                             <div class="hidden">
                                 <label class="text-xs text-gray-500 block mb-1">Roll Number (Removed)</label>
                                 <p id="profile-roll" class="text-white font-medium">Not set</p>
                             </div>
                             <div>
                                 <label class="text-xs text-gray-500 block mb-1">Mobile Number / Alt Email</label>
                                 <p id="profile-mobile" class="text-white font-medium">Not set</p>
                             </div>
                         </div>
                     </div>
                 </div>

                 <!-- Achievements Tab -->
                 <div id="profile-achievements" class="profile-tab-content hidden space-y-8 animate-fade-in">
                     <div>
                         <h3 class="text-xl font-bold text-white mb-2">Achievements & Badges</h3>
                         <p class="text-sm text-gray-400 mb-6">Your progress towards becoming an attendance legend.</p>
                         
                         <div class="bg-black/20 rounded-2xl p-8 border border-white/5 flex flex-col justify-center relative overflow-hidden text-center">
                              <div class="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                              <h3 class="text-sm font-medium text-gray-400 mb-2">Total Badges Unlocked</h3>
                              <p id="profile-achievements-unlocked" class="text-5xl font-black text-purple-400 mb-4">0 <span class="text-xl text-gray-500 font-medium">/ 20</span></p>
                              <p class="text-sm text-gray-500 max-w-xs mx-auto">Keep attending classes and maintaining high streaks to unlock more exclusive badges!</p>
                         </div>
                     </div>
                 </div>
            </div>
        </div>
    </div>
`;
