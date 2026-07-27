import PushSubscription from '../db/models/PushSubscription.mjs';
import config from '../config/index.mjs';
import { AppError } from '../middleware/error-handler.mjs';

export async function subscribe(req, res) {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
        throw new AppError('Invalid push subscription payload', 400);
    }

    const userAgent = req.headers['user-agent'] || '';

    const subscription = await PushSubscription.findOneAndUpdate(
        { endpoint },
        {
            userId: req.user.id,
            endpoint,
            keys,
            userAgent,
        },
        { upsert: true, returnDocument: 'after' }
    );

    res.json({ message: 'Push subscription saved successfully', subscription });
}

export async function unsubscribe(req, res) {
    const { endpoint } = req.body;

    if (!endpoint) {
        throw new AppError('Endpoint is required', 400);
    }

    await PushSubscription.deleteOne({ endpoint });
    res.json({ message: 'Push subscription removed' });
}

export function getVapidPublicKey(req, res) {
    res.json({ vapidPublicKey: config.vapidPublicKey });
}
