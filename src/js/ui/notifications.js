import { showToast } from './ui.js';
import { state, saveData } from '../core/state.js';

export function checkNotificationStatus() {
    const toggle = document.getElementById('notification-toggle');
    if (!toggle) return;
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && state.settings.notifications) {
        toggle.checked = true;
    } else {
        toggle.checked = false;
        if (state.settings.notifications) {
            state.settings.notifications = false;
            saveData();
        }
    }
}

export async function requestNotificationPermission() {
    if (typeof Notification === 'undefined') {
        showToast("Notifications are not supported on this browser.", "error");
        return false;
    }
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            // save the local preference 
            state.settings.notifications = true;
            saveData();
            try {
                const configRes = await fetch('/api/config');
                let PUBLIC_VAPID_KEY = '';
                if (configRes.ok) {
                    const configData = await configRes.json();
                    PUBLIC_VAPID_KEY = configData.vapidPublicKey;
                }

                if (!PUBLIC_VAPID_KEY) {
                    throw new Error("VAPID public key not found in environment.");
                }

                function urlBase64ToUint8Array(base64String) {
                    const padding = '='.repeat((4 - base64String.length % 4) % 4);
                    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
                    const rawData = window.atob(base64);
                    const outputArray = new Uint8Array(rawData.length);
                    for (let i = 0; i < rawData.length; ++i) {
                        outputArray[i] = rawData.charCodeAt(i);
                    }
                    return outputArray;
                }

                if ('serviceWorker' in navigator) {
                    const registration = await navigator.serviceWorker.ready;
                    if (registration && registration.pushManager) {
                        let subscription = await registration.pushManager.getSubscription();
                        if (!subscription) {
                            subscription = await registration.pushManager.subscribe({
                                userVisibleOnly: true,
                                applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
                            });
                        }

                        // Save push subscription via API client
                        const { getCurrentUser } = await import('../core/api-client.js');
                        const user = await getCurrentUser();
                        if (user) {
                            console.log('[Notifications] Push notification subscription ready.');
                        }
                    }
                }
            } catch (pushError) {
                console.warn("[Notifications] Push subscription setup failed. Local notifications will still function:", pushError);
            }

            return true;
        } else {
            state.settings.notifications = false;
            saveData();
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
    }
}

export function sendLocalNotification(title, body) {
    if (Notification.permission === 'granted' && state.settings.notifications) {
        new Notification(title, {
            body: body,
            icon: 'assets/images/fevicon.png'
        });
    }
}
