import webPush from 'web-push';
import config from '../config/index.mjs';
import UserData from '../db/models/UserData.mjs';
import PushSubscription from '../db/models/PushSubscription.mjs';
import { isDbConnected } from '../db/connection.mjs';

const sentReminders = new Set();
let intervalId = null;

function initWebPush() {
    if (config.vapidPublicKey && config.vapidPrivateKey) {
        try {
            webPush.setVapidDetails(
                config.vapidSubject,
                config.vapidPublicKey,
                config.vapidPrivateKey
            );
            console.log('[ReminderService] ✓ Web Push VAPID details configured.');
        } catch (err) {
            console.warn('[ReminderService] Failed to set VAPID details:', err.message);
        }
    } else {
        console.warn('[ReminderService] ⚠ VAPID keys missing. Web push notifications disabled until keys are set in .env.');
    }
}

// 24-hour HH:MM format
function formatHHMM(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function getDayName(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
}

function cleanupSentCache() {
    if (sentReminders.size > 5000) {
        sentReminders.clear();
    }
}

export async function checkUpcomingClassesAndNotify() {
    if (!isDbConnected()) return;
    if (!config.vapidPublicKey || !config.vapidPrivateKey) return;

    try {
        cleanupSentCache();

        const now = new Date();
        const currentDay = getDayName(now);
        const dateStr = now.toISOString().split('T')[0];

        // Calculate target times for 10m and 5m alerts
        const time10mDate = new Date(now.getTime() + 10 * 60 * 1000);
        const time5mDate  = new Date(now.getTime() + 5 * 60 * 1000);

        const target10m = formatHHMM(time10mDate);
        const target5m  = formatHHMM(time5mDate);

        const allUserData = await UserData.find({
            schedule: { $exists: true, $not: { $size: 0 } }
        });

        for (const userRecord of allUserData) {
            const schedule = userRecord.schedule || [];

            for (const cls of schedule) {
                if (!cls.day || !cls.start || !cls.name) continue;

                const matchesDay = cls.day.toLowerCase().startsWith(currentDay.toLowerCase().substring(0, 3));
                if (!matchesDay) continue;

                let minutesLeft = 0;
                if (cls.start === target10m) minutesLeft = 10;
                else if (cls.start === target5m) minutesLeft = 5;

                if (minutesLeft === 0) continue;

                const dedupeKey = `${dateStr}:${userRecord.userId.toString()}:${cls.id || cls.name}:${minutesLeft}`;
                if (sentReminders.has(dedupeKey)) continue;

                const sentCount = await sendClassNotification(userRecord.userId, cls, minutesLeft);
                if (sentCount > 0) {
                    sentReminders.add(dedupeKey);
                }
            }
        }
    } catch (err) {
        console.error('[ReminderService] Error during reminder scan:', err.message);
    }
}

async function sendClassNotification(userId, classObj, minutesLeft) {
    const subscriptions = await PushSubscription.find({ userId });
    if (!subscriptions || subscriptions.length === 0) return 0;

    const title = `Class Starting in ${minutesLeft}m!`;
    const roomInfo = classObj.room ? ` in Room ${classObj.room}` : '';
    const body = `${classObj.name}${roomInfo} starts at ${classObj.start}`;

    const payload = JSON.stringify({
        title,
        body,
        url: '/?view=schedule',
        vibrate: [200, 100, 200, 100, 200],
    });

    let successCount = 0;

    for (const sub of subscriptions) {
        try {
            const pushSub = {
                endpoint: sub.endpoint,
                keys: sub.keys,
            };

            await webPush.sendNotification(pushSub, payload);
            successCount++;
        } catch (pushErr) {
            console.warn(`[ReminderService] Push failed for user ${userId}:`, pushErr.message);
          
            if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
                await PushSubscription.deleteOne({ _id: sub._id });
                console.log(`[ReminderService] Removed expired subscription ${sub._id}`);
            }
        }
    }

    return successCount;
}

export function startReminderService() {
    initWebPush();

    if (intervalId) clearInterval(intervalId);
    
    // check in every 60 seconds
    intervalId = setInterval(checkUpcomingClassesAndNotify, 60 * 1000);
    console.log('[ReminderService] ✓ 1-minute background class reminder scanner started.');
}
