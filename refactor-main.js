const fs = require('fs');

console.log("Refactoring main.js...");

const mainJsSource = fs.readFileSync('src/js/main.js', 'utf8');

// The helper functions start at `function handleNotificationToggle(e) {` (which is around line 335)
// and go to the end, right before `if ('serviceWorker' in navigator)`
const helperFunctionsRegex = /(function handleNotificationToggle[\s\S]*)(if \('serviceWorker' in navigator\))/;
const match = mainJsSource.match(helperFunctionsRegex);

if (match) {
    const helpersStr = match[1];
    
    // Create src/js/app-helpers.js
    let helperFileContent = `import { state, saveData, dateIsWithinTerm } from './state.js';
import { calculateOverallAttendance, calculateStreak, calculateAttendanceForCourse, renderReports } from './attendance.js';
import { showToast, showConfirmationModal, toggleModal } from './ui.js';
import { updateAllViews, countdownInterval, setCountdownInterval } from './main.js';

` + helpersStr;

    // We must export all these functions so main.js can use them
    const exportedHelpers = [
        "export " + helpersStr.replace(/function ([a-zA-Z0-9_]+)/g, 'function $1').replace(/const ([a-zA-Z0-9_]+) = /g, 'const $1 = ')
    ];
    
    // Let's just use simple exports by prefixing export
    let modifiedHelpersStr = helpersStr
        .replace(/^function/gm, 'export function')
        .replace(/^const checkNotificationStatus/gm, 'export const checkNotificationStatus')
        .replace(/^const requestNotificationPermission/gm, 'export const requestNotificationPermission');

    const finalHelperFile = `import { state, saveData, dateIsWithinTerm } from './state.js';
import { calculateOverallAttendance, calculateStreak, calculateAttendanceForCourse, renderReports } from './attendance.js';
import { showToast, showConfirmationModal, toggleModal } from './ui.js';
import { updateAllViews, setCountdownInterval } from './main.js';

// We get countdownInterval from main.js dynamically or pass it
let countdownInterval = null;
export function getCountdownInterval() { return countdownInterval; }
export function updateInterval(v) { countdownInterval = v; }

` + modifiedHelpersStr;

    fs.writeFileSync('src/js/app-helpers.js', finalHelperFile);
    console.log("Created app-helpers.js");
    
    // Now remove these from main.js and add the imports
    let newMainJs = mainJsSource.replace(match[1], '');
    
    const helperImports = `import { handleNotificationToggle, checkNotificationStatus, requestNotificationPermission, handleSidebarNav, navigateTo, updateOverviewStats, updateGoalOrientedCard, updateNextClassCountdown, renderArchivedTermsList, toggleArchivedTermsList, updateTermDatesUI, saveTermDates, archiveCurrentTerm, exportHistoryToCSV, exportData, importData, renderOverviewCards, startOnboardingTour } from './app-helpers.js';\n`;
    
    // Inject imports after existing imports
    newMainJs = newMainJs.replace(/(import .*;\n)+/, (match) => match + helperImports);
    
    fs.writeFileSync('src/js/main.js', newMainJs);
    console.log("Updated main.js");

} else {
    console.log("Could not find helper functions chunk.");
}
