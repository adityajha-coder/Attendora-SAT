/**
 * CLOUD SYNC SERVICE
 * Handles bidirectional sync between localStorage (fast offline) and Firestore (cloud backup).
 * - On login: loads cloud data, merges with local, writes back to both.
 * - On saveData(): debounced write to Firestore + immediate localStorage write.
 * - Provides a visual sync status indicator for UX.
 */

import { db, auth } from '../core/firebase.js';
import { 
    doc, 
    setDoc, 
    getDoc,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { showToast } from '../ui/ui.js';

let syncTimeoutId = null;
const SYNC_DEBOUNCE_MS = 2000; // 2 seconds after last change

// Keys from state to persist to the cloud
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

/**
 * Shows a small sync status indicator in the UI
 */
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
            // Fade out after 3s
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

/**
 * Extracts the persistable subset from the app state.
 */
function extractPersistableState(state) {
    const data = {};
    PERSISTABLE_KEYS.forEach(key => {
        if (state[key] !== undefined) {
            data[key] = JSON.parse(JSON.stringify(state[key])); // deep clone to strip proxies/refs
        }
    });
    return data;
}

/**
 * Saves the current app state to Firestore (debounced).
 * Call this every time saveData() is called.
 */
export function schedulCloudSync(state) {
    if (syncTimeoutId) clearTimeout(syncTimeoutId);

    syncTimeoutId = setTimeout(async () => {
        const user = auth.currentUser;
        if (!user) return; // not logged in

        try {
            setSyncStatus('syncing');
            const persistable = extractPersistableState(state);
            await setDoc(doc(db, "userData", user.uid), {
                ...persistable,
                lastSyncedAt: serverTimestamp(),
                email: user.email
            }, { merge: true });
            setSyncStatus('synced');
        } catch (error) {
            console.error('[CloudSync] Failed to save to Firestore:', error);
            setSyncStatus('error');
        }
    }, SYNC_DEBOUNCE_MS);
}

/**
 * Loads user data from Firestore.
 * Returns null if no cloud data exists.
 */
export async function loadFromCloud() {
    const user = auth.currentUser;
    if (!user) return null;

    try {
        setSyncStatus('syncing');
        const docSnap = await getDoc(doc(db, "userData", user.uid));
        if (docSnap.exists()) {
            setSyncStatus('synced');
            return docSnap.data();
        } else {
            setSyncStatus('idle');
            return null;
        }
    } catch (error) {
        console.error('[CloudSync] Failed to load from Firestore:', error);
        setSyncStatus('error');
        return null;
    }
}

/**
 * Merges cloud data into the local state.
 * Strategy: Cloud wins if cloud data has content and local is empty/default,
 * otherwise uses a "most data wins" merge with cloud taking priority.
 */
export function mergeCloudData(state, cloudData) {
    if (!cloudData) return false;

    let merged = false;
    
    // If local has no real data but cloud does, cloud wins entirely
    const localHasData = state.schedule.length > 0 || state.history.length > 0;
    const cloudHasData = (cloudData.schedule?.length > 0) || (cloudData.history?.length > 0);

    if (!localHasData && cloudHasData) {
        // Fresh device: cloud data wins entirely
        PERSISTABLE_KEYS.forEach(key => {
            if (cloudData[key] !== undefined) {
                if (key === 'settings') {
                    Object.assign(state[key], cloudData[key]);
                } else if (key === 'achievements') {
                    Object.assign(state[key], cloudData[key]);
                } else {
                    state[key] = cloudData[key];
                }
            }
        });
        merged = true;
    } else if (localHasData && cloudHasData) {
        // Both have data: use the one with more history entries (more recent data)
        const localHistoryCount = state.history.length;
        const cloudHistoryCount = cloudData.history?.length || 0;

        if (cloudHistoryCount > localHistoryCount) {
            PERSISTABLE_KEYS.forEach(key => {
                if (cloudData[key] !== undefined) {
                    if (key === 'settings') {
                        Object.assign(state[key], cloudData[key]);
                    } else if (key === 'achievements') {
                        // Merge achievements: keep unlocked ones from both
                        const mergedAchievements = { ...state[key] };
                        Object.keys(cloudData[key] || {}).forEach(achKey => {
                            const cloudAch = cloudData[key][achKey];
                            const localAch = mergedAchievements[achKey];
                            if (cloudAch?.unlocked && !localAch?.unlocked) {
                                mergedAchievements[achKey] = cloudAch;
                            } else if (cloudAch && !localAch) {
                                mergedAchievements[achKey] = cloudAch;
                            }
                        });
                        state[key] = mergedAchievements;
                    } else {
                        state[key] = cloudData[key];
                    }
                }
            });
            merged = true;
        }
        // If local has more data, we keep local and the next saveData() will push it to cloud
    } else if (!cloudHasData && localHasData) {
        // Local has data, cloud is empty — do nothing, next save will push to cloud
    }

    return merged;
}

/**
 * Force-push current state to cloud immediately (for initial sync after signup).
 */
export async function forceCloudSave(state) {
    const user = auth.currentUser;
    if (!user) return;

    try {
        setSyncStatus('syncing');
        const persistable = extractPersistableState(state);
        await setDoc(doc(db, "userData", user.uid), {
            ...persistable,
            lastSyncedAt: serverTimestamp(),
            email: user.email
        }, { merge: true });
        setSyncStatus('synced');
    } catch (error) {
        console.error('[CloudSync] Force save failed:', error);
        setSyncStatus('error');
    }
}
