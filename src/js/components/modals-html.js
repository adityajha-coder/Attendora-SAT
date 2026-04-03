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
        <div class="modal-content card max-w-xl w-full p-6 sm:p-8 rounded-2xl transform scale-95 no-hover" data-intro="Customize your experience, manage data, and toggle light/dark mode here." data-step="10">
            <div class="flex justify-between items-start mb-6">
                <h2 class="text-2xl font-bold text-white">Application Settings</h2>
                <button class="close-modal-btn text-gray-400 hover:text-white text-3xl" aria-label="Close settings">&times;</button>
            </div>
             <div class="space-y-6">
                <div class="border-b border-white/10 pb-4">
                    <h3 class="text-lg font-bold text-white mb-4">Appearance & Theme</h3>
                    <div class="p-4 bg-white/5 rounded-lg space-y-4">
                        <div class="flex items-center justify-between">
                            <span class="font-medium text-white">Theme Accent</span>
                            <div id="theme-picker" class="flex gap-2">
                            </div>
                        </div>
                        <div class="flex items-center justify-between border-t border-white/10 pt-4">
                            <span class="font-medium text-white">Light Mode</span>
                            <div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" name="toggle-theme" id="theme-toggle" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" aria-label="Toggle light mode"/>
                                <label for="theme-toggle" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-600 cursor-pointer"></label>
                            </div>
                        </div>
                    </div>
                </div>
                 
                <div class="border-b border-white/10 pb-4">
                    <h3 class="text-lg font-bold text-white mb-4">Notifications & Reminders</h3>
                    <div class="p-4 bg-white/5 rounded-lg">
                         <div class="flex items-center justify-between">
                            <span class="font-medium text-white">Enable Class Reminders</span>
                            <div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" name="toggle-notifications" id="notification-toggle" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" aria-label="Toggle class reminders"/>
                                <label for="notification-toggle" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-600 cursor-pointer"></label>
                            </div>
                        </div>
                        <p id="notification-status-text" class="text-sm text-gray-400 mt-2"></p>
                    </div>
                </div>

                <div class="border-b border-white/10 pb-4">
                    <h3 class="text-lg font-bold text-white mb-4">Term/Semester Management</h3>
                    <div class="space-y-3 p-4 bg-white/5 rounded-lg">
                        <p class="text-sm text-gray-400">Current Term: <span id="current-term-dates" class="font-semibold text-white">N/A</span></p>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label for="term-start-date" class="block mb-1 text-xs font-medium text-gray-300">Term Start Date</label>
                                <input type="date" id="term-start-date" class="form-input p-2 text-sm" aria-label="Term Start Date">
                            </div>
                            <div>
                                <label for="term-end-date" class="block mb-1 text-xs font-medium text-gray-300">Term End Date</label>
                                <input type="date" id="term-end-date" class="form-input p-2 text-sm" aria-label="Term End Date">
                            </div>
                        </div>
                        <button id="save-term-dates-btn" class="w-full bg-blue-500/50 text-white font-semibold py-2 rounded-lg hover:bg-blue-500/80 transition-colors" aria-label="Save term dates">Save Current Term Dates</button>
                        
                        <div class="pt-4 border-t border-white/10">
                             <button id="view-archived-terms-btn" class="w-full text-blue-400 hover:text-blue-300 font-medium text-sm text-center" aria-label="View archived terms">View Archived Terms (<span id="archived-count">0</span>)</button>
                             <div id="archived-terms-list" class="mt-3 space-y-2 max-h-40 overflow-y-auto hidden">
                             </div>
                        </div>
                    </div>
                </div>

                 <div class="p-4 bg-red-800/20 rounded-lg border border-red-400/50">
                     <h3 class="text-lg font-bold text-red-400 mb-4">Danger Zone</h3>
                      <p class="text-sm text-red-300 mb-4">Be careful, these actions permanently affect your tracking data or security.</p>
                      <div class="space-y-3">
                          <button id="archive-term-btn-danger" class="w-full btn-danger text-white font-semibold py-2 rounded-lg" aria-label="Archive current term">Archive Current Term & Start New</button>
                          <div class="grid grid-cols-2 gap-4">
                            <button id="export-data-btn" class="bg-white/10 text-white font-semibold py-2 px-5 rounded-lg border border-white/20 hover:bg-white/20" aria-label="Export all data">Export Backup</button>
                            <label for="import-data-input" class="bg-red-500/80 text-white text-center font-semibold py-2 px-5 rounded-lg cursor-pointer hover:bg-red-700" aria-label="Import data">Import Backup</label>
                            <input type="file" id="import-data-input" class="hidden" accept=".json">
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
                <h2 class="text-4xl font-bold text-white font-brand hero-glow">Your Semester Wrapped!</h2>
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
`;
