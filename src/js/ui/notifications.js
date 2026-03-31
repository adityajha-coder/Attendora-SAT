import { showToast } from './ui.js';
import { state, saveData } from '../core/state.js';

export function checkNotificationStatus() {
    const toggle = document.getElementById('notification-toggle');
    if (!toggle) return;
    if (Notification.permission === 'granted' && state.settings.notifications) {
        toggle.checked = true;
    } else {
        toggle.checked = false;
        state.settings.notifications = false;
        saveData();
    }
}

export async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            state.settings.notifications = true;
            saveData();
            showToast("Notifications enabled!");
            return true;
        } else {
            state.settings.notifications = false;
            saveData();
            showToast("Notification permission denied.", "error");
            return false;
        }
    } catch (error) {
        console.error("Error requesting notifications:", error);
        return false;
    }
}

export function handleNotificationToggle(e) {
    if (e.target.checked) {
        requestNotificationPermission();
    } else {
        state.settings.notifications = false;
        saveData();
        showToast("Notifications disabled.");
    }
}

export function sendLocalNotification(title, body) {
    if (Notification.permission === 'granted' && state.settings.notifications) {
        new Notification(title, {
            body: body,
            icon: 'assets/images/android.png'
        });
    }
}
