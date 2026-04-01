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
        const base64Image = e.target.result;
        try {
            const OPENROUTER_KEY = "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";
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'openai/gpt-4o-mini',
                    messages: [
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'text',
                                    text: 'You are a highly accurate data extraction AI. Extract the classes schedule from this timetable image grid. There is a vertical column spanning all days that says "LUNCH". You MUST extract all classes that occur to the left AND to the right of the LUNCH column. CRITICAL RULE: Map the abbreviated subjects to their full faculty/instructor names and full subject names using the legend at the bottom of the image. For example, if the grid says "CM", look up "CM" in the legend to find "Computational Methods (CM)" and the corresponding instructor name. If a class is split into groups (e.g. G1/G2), extract them separately with the group name in parenthesis. Return ONLY a valid JSON array of objects without any markdown formatting, backticks, or extra text. Use this exact structure: {"day": "Monday", "start": "09:30", "end": "10:20", "name": "Class Name", "instructor": "Instructor Name", "room": "Room Number"}. Map abbreviations to full day names. Convert ALL PM times strictly to 24-hour HH:MM format (e.g., 1:40 is 13:40, 2:30 is 14:30). If a class spans multiple periods, adjust the start and end time accordingly. Exclude "LUNCH", "BREAK", "LIB", "PDP", or empty cells. Do not skip any valid classes. Return [] if no classes are found.'
                                },
                                {
                                    type: 'image_url',
                                    image_url: {
                                        url: base64Image
                                    }
                                }
                            ]
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error("OpenRouter API Error:", errorData);
                throw new Error(`OpenRouter Error: ${response.status} - failed to process image.`);
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
        state.schedule.sort((a,b) => a.start.localeCompare(b.start)); 
        checkAchievements();
        saveData();
        window.dispatchEvent(new CustomEvent('attendora-update-ui'));
        toggleModal(document.getElementById('scan-timetable-modal'), false); 
        showToast(`${newClassesAdded} classes added, replacing your old schedule!`);
    } else if(errorCount === 0) {
        showToast("No valid classes were found to save.", "error");
    }
}
