import { showToast, toggleModal } from '../ui/ui.js';
import { state, saveData } from '../core/state.js';
import { checkAchievements } from './gamification.js';

export function openTimetableScanner() {
    const scanTimetableModal = document.getElementById('scan-timetable-modal');
    scanTimetableModal.querySelector('#scan-upload-view').classList.remove('hidden');
    scanTimetableModal.querySelector('#scan-processing-view').classList.add('hidden');
    scanTimetableModal.querySelector('#scan-correction-view').classList.add('hidden');
    document.getElementById('timetable-file-input').value = '';
    toggleModal(scanTimetableModal, true);
}

export async function handleTimetableScan(event) {
    const file = event.target.files[0];
    if (!file) return;
    const scanTimetableModal = document.getElementById('scan-timetable-modal');
    scanTimetableModal.querySelector('#scan-upload-view').classList.add('hidden');
    scanTimetableModal.querySelector('#scan-processing-view').classList.remove('hidden');
    showToast("Analyzing timetable using AI...", "info");

    const reader = new FileReader();
    reader.onload = async (e) => {
        const img = new Image();
        img.onload = async () => {
            // Downscale image to max 1024px width to prevent API 400 errors for too large payloads
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const MAX_WIDTH = 1024;
            
            if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Compress heavily to ensure Groq accepts it
            const base64Image = canvas.toDataURL('image/jpeg', 0.6);

            try {
                const response = await fetch('/api/scan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        base64Image: base64Image
                    })
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    let parsedError = errorData;
                    try {
                        const jsonError = JSON.parse(errorData);
                        if (jsonError.error) parsedError = jsonError.error;
                    } catch (err) {}
                    
                    console.error("Backend API Error:", errorData);
                    throw new Error(parsedError);
                }

                const data = await response.json();
                const aiResponseText = data.choices[0].message.content.trim();
                
                let scannedData = [];
                try {
                    // Strip possible markdown wrapping
                    const cleanedText = aiResponseText.replace(/```json/gi, '').replace(/```/g, '').trim();
                    scannedData = JSON.parse(cleanedText);
                } catch (parseError) {
                    console.error("Failed to parse AI response: ", aiResponseText);
                    showToast("Failed to parse timetable data from AI.", "error");
                    scanTimetableModal.querySelector('#scan-upload-view').classList.remove('hidden');
                    scanTimetableModal.querySelector('#scan-processing-view').classList.add('hidden');
                    return;
                }

                if (!Array.isArray(scannedData) || scannedData.length === 0) {
                    showToast("No classes detected from the image.", "warning");
                    scanTimetableModal.querySelector('#scan-upload-view').classList.remove('hidden');
                    scanTimetableModal.querySelector('#scan-processing-view').classList.add('hidden');
                    return;
                }

                showToast("Timetable analyzed successfully!", "success");
                renderCorrectionView(scannedData);

            } catch (error) {
                console.error('Error analyzing timetable:', error);
                showToast(`${error.message || "Failed to communicate with Server"}`, "error");
                scanTimetableModal.querySelector('#scan-upload-view').classList.remove('hidden');
                scanTimetableModal.querySelector('#scan-processing-view').classList.add('hidden');
            }
        };
        img.onerror = () => {
             showToast("Error processing the image file.", "error");
             scanTimetableModal.querySelector('#scan-upload-view').classList.remove('hidden');
             scanTimetableModal.querySelector('#scan-processing-view').classList.add('hidden');
        };
        img.src = e.target.result;
    };
    reader.onerror = () => {
        showToast("Error reading the image file.", "error");
        scanTimetableModal.querySelector('#scan-upload-view').classList.remove('hidden');
        scanTimetableModal.querySelector('#scan-processing-view').classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

function renderCorrectionView(scannedData) {
    const container = document.getElementById('correction-grid-container');
    container.innerHTML = `
        <table class="w-full text-left">
            <thead>
                <tr class="border-b border-white/10 text-xs sm:text-sm">
                    <th class="p-2">Day</th>
                    <th class="p-2">Start</th>
                    <th class="p-2">End</th>
                    <th class="p-2">Subject Name</th>
                    <th class="p-2">Instructor</th>
                    <th class="p-2">Room</th>
                </tr>
            </thead>
            <tbody id="correction-tbody"></tbody>
        </table>
    `;
    const tbody = document.getElementById('correction-tbody');
    const validDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    scannedData.forEach((entry) => {
        const day = validDays.find(d => entry.day && d.toLowerCase().startsWith(entry.day.toLowerCase().substring(0, 3))) || entry.day;
        const tr = document.createElement('tr');
        tr.className = 'border-b border-white/5';
        tr.innerHTML = `
            <td class="p-1"><input type="text" value="${day || ''}" class="form-input p-2 text-sm" data-field="day"></td>
            <td class="p-1"><input type="time" value="${entry.start || ''}" class="form-input p-2 text-sm" data-field="start"></td>
            <td class="p-1"><input type="time" value="${entry.end || ''}" class="form-input p-2 text-sm" data-field="end"></td>
            <td class="p-1"><input type="text" value="${entry.name || ''}" class="form-input p-2 text-sm" data-field="name"></td>
            <td class="p-1"><input type="text" value="${entry.instructor || ''}" class="form-input p-2 text-sm" data-field="instructor"></td>
            <td class="p-1"><input type="text" value="${entry.room || ''}" class="form-input p-2 text-sm" data-field="room"></td>
        `;
        tbody.appendChild(tr);
    });
    const scanTimetableModal = document.getElementById('scan-timetable-modal');
    scanTimetableModal.querySelector('#scan-processing-view').classList.add('hidden');
    scanTimetableModal.querySelector('#scan-correction-view').classList.remove('hidden');
}

export function handleSaveScannedSchedule() {
    const tbody = document.getElementById('correction-tbody');
    const rows = tbody.querySelectorAll('tr');
    let newClassesAdded = 0;
    let errorCount = 0;
    const newSchedule = [];
    const validDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    rows.forEach(row => {
        const nameInput = row.querySelector('input[data-field="name"]');
        const dayInput = row.querySelector('input[data-field="day"]');
        const startInput = row.querySelector('input[data-field="start"]');
        const endInput = row.querySelector('input[data-field="end"]');
        const instructorInput = row.querySelector('input[data-field="instructor"]');
        const roomInput = row.querySelector('input[data-field="room"]');
        const name = nameInput.value.trim();
        const day = dayInput.value.trim();
        const start = startInput.value.trim();
        const end = endInput.value.trim();
        const instructor = instructorInput ? instructorInput.value.trim() : '';
        const room = roomInput ? roomInput.value.trim() : '';
        if (name && day && start && end) {
            if (!validDays.some(d => d.toLowerCase() === day.toLowerCase()) || end <= start) {
                errorCount++;
                return;
            }
            const classData = {
                id: Date.now() + Math.random(),
                name: name,
                instructor: instructor,
                room: room,
                day: day.charAt(0).toUpperCase() + day.slice(1).toLowerCase(),
                type: name.toLowerCase().includes('lab') ? 'Lab' : 'Class',
                start: start,
                end: end,
            };
            newSchedule.push(classData);
            newClassesAdded++;
        }
    });
    if (errorCount > 0) {
        showToast(`${errorCount} entries were skipped due to invalid data.`, "warning");
    }
    if (newClassesAdded > 0) {
        state.schedule = newSchedule;
        state.history = [];
        state.assignments = [];
        state.gpaCourses = [];
        state.schedule.sort((a, b) => a.start.localeCompare(b.start));
        checkAchievements();
        saveData();
        window.dispatchEvent(new CustomEvent('attendora-update-ui'));
        toggleModal(document.getElementById('scan-timetable-modal'), false);
        showToast(`${newClassesAdded} classes added, replacing your old schedule!`);
    } else if (errorCount === 0) {
        showToast("No valid classes were found to save.", "error");
    }
}
