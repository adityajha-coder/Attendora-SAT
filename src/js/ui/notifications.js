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
            const PUBLIC_VAPID_KEY = 'BAIyDUZbcQ2HMLsF1BiaieX56u89ch7YRO_j-kkf8tfDcVtSlAOybewq1qq4aen5WLr1QlccKr0jPxOjsqv2-O8';
            
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

            const registration = await navigator.serviceWorker.ready;
            let subscription = await registration.pushManager.getSubscription();
            if (!subscription) {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
                });
            }

            // Save to Supabase
            const { supabase } = await import('../core/supabase.js');
            const { data: { session } } = await supabase.auth.getSession();
            if (session && session.user) {
                await supabase.from('users').update({ push_subscription: subscription }).eq('id', session.user.id);
            }

            state.settings.notifications = true;
            saveData();
            showToast("Push Notifications enabled!");
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
            icon: 'assets/images/fevicon.png'
        });
    }
}
