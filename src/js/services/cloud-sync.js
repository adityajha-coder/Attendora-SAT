import { fetchUserData, saveUserData, getCurrentUser } from '../core/api-client.js';

let syncTimeoutId = null;
const SYNC_DEBOUNCE_MS = 2000; 

const PERSISTABLE_KEYS = [
    'userProfile',
    'schedule',
    'history',
    'assignments',
    'gpaCourses',
    'archivedTerms',
    'achievements',
    'settings'
];

function setSyncStatus(status) {
    let indicator = document.getElementById('cloud-sync-indicator');
    if (!indicator) return;

    switch (status) {
        case 'syncing':
            indicator.innerHTML = `
                <svg class="animate-spin h-4 w-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-xs text-blue-400">Syncing...</span>
            `;
            indicator.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 transition-all duration-300';
            break;
        case 'synced':
            indicator.innerHTML = `
                <svg class="h-4 w-4 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                </svg>
                <span class="text-xs text-green-400">Synced</span>
            `;
            indicator.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 transition-all duration-300';
            
            setTimeout(() => {
                if (indicator.querySelector('.text-green-400')) {
                    indicator.innerHTML = `
                        <svg class="h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                        </svg>
                        <span class="text-xs text-gray-500">Cloud saved</span>
                    `;
                    indicator.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 transition-all duration-300';
                }
            }, 3000);
            break;
        case 'error':
            indicator.innerHTML = `
                <svg class="h-4 w-4 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                </svg>
                <span class="text-xs text-red-400">Offline</span>
            `;
            indicator.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 transition-all duration-300';
            break;
        case 'idle':
        default:
            indicator.innerHTML = `
                <svg class="h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M1 12.5A4.5 4.5 0 005.5 17H15a4 4 0 001.866-7.539 3.504 3.504 0 00-4.504-4.272A4.5 4.5 0 004.06 8.235 4.502 4.502 0 001 12.5z" />
                </svg>
                <span class="text-xs text-gray-500">Cloud saved</span>
            `;
            indicator.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 transition-all duration-300';
            break;
    }
}

function extractPersistableState(state) {
    const data = {};
    PERSISTABLE_KEYS.forEach(key => {
        if (state[key] !== undefined) {
            data[key] = JSON.parse(JSON.stringify(state[key])); 
        }
    });
    return data;
}

export function schedulCloudSync(state) {
    if (syncTimeoutId) clearTimeout(syncTimeoutId);

    // Safeguard
    const hasDataToSync = (state.schedule && state.schedule.length > 0) ||
                          (state.history && state.history.length > 0) ||
                          (state.assignments && state.assignments.length > 0) ||
                          (state.gpaCourses && state.gpaCourses.length > 0);

    if (!hasDataToSync) return;

    syncTimeoutId = setTimeout(async () => {
        const user = await getCurrentUser();
        if (!user) return; 

        try {
            setSyncStatus('syncing');
            const persistable = extractPersistableState(state);
            await saveUserData(persistable);
            setSyncStatus('synced');
        } catch (error) {
            console.error('[CloudSync] Failed to save:', error);
            setSyncStatus('error');
        }
    }, SYNC_DEBOUNCE_MS);
}

export async function loadFromCloud() {
    const user = await getCurrentUser();
    if (!user) return null;

    try {
        setSyncStatus('syncing');
        const cloudData = await fetchUserData();
        
        if (cloudData) {
            setSyncStatus('synced');
            return cloudData;
        } else {
            setSyncStatus('idle');
            return null;
        }
    } catch (error) {
        console.error('[CloudSync] Failed to load from cloud:', error);
        setSyncStatus('error');
        return null;
    }
}

export function mergeCloudData(state, cloudData) {
    if (!cloudData) return false;

    let merged = false;

    const cloudHasContent = 
        (cloudData.schedule && cloudData.schedule.length > 0) ||
        (cloudData.history && cloudData.history.length > 0) ||
        (cloudData.assignments && cloudData.assignments.length > 0) ||
        (cloudData.gpaCourses && cloudData.gpaCourses.length > 0) ||
        (cloudData.archivedTerms && cloudData.archivedTerms.length > 0);

    if (!cloudHasContent) return false;

    PERSISTABLE_KEYS.forEach(key => {
        if (cloudData[key] !== undefined && cloudData[key] !== null) {
            if (Array.isArray(cloudData[key])) {
                if (!state[key] || state[key].length === 0 || cloudData[key].length >= state[key].length) {
                    state[key] = JSON.parse(JSON.stringify(cloudData[key]));
                    merged = true;
                }
            } else if (key === 'settings') {
                Object.assign(state[key], cloudData[key]);
                merged = true;
            } else if (key === 'achievements') {
                state[key] = { ...state[key], ...cloudData[key] };
                merged = true;
            }
        }
    });

    return merged;
}

export async function forceCloudSave(state) {
    const user = await getCurrentUser();
    if (!user) return;

    try {
        setSyncStatus('syncing');
        const persistable = extractPersistableState(state);
        await saveUserData(persistable);
        setSyncStatus('synced');
    } catch (error) {
        console.error('[CloudSync] Force save failed:', error);
        setSyncStatus('error');
    }
}
