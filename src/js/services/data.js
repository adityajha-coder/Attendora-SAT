import { state, saveData } from '../core/state.js';
import { showToast } from '../ui/ui.js';

export function exportHistoryToCSV() {
    if (state.history.length === 0) {
        showToast("No attendance data to export.", "warning");
        return;
    }
    const headers = ["Date", "Course Name", "Status", "Reason", "Note"];
    const csvContent = "data:text/csv;charset=utf-8," + 
        headers.join(",") + "\n" +
        state.history.map(h => {
            const course = state.schedule.find(c => c.id === h.classId);
            return [h.date, course ? course.name : "Unknown", h.status, h.reason || "", h.note || ""].join(",");
        }).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendora_Attendance_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exporting attendance history as CSV...");
}

export function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `Attendora_Full_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    showToast("Full backup export complete.");
}

export function importData() {
    const fileInput = document.getElementById('import-data-input');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
            try {
                const importedState = JSON.parse(evt.target.result);
                Object.assign(state, importedState);
                saveData();
                showToast("Data imported successfully!");
                window.location.reload(); 
            } catch (err) {
                showToast("Invalid data file format.", "error");
            }
        }
        reader.onerror = function (evt) {
            showToast("Error reading the file.", "error");
        }
    }
}
