import PushSubscription from '../db/models/PushSubscription.mjs';
import User from '../db/models/User.mjs';
import config from '../config/index.mjs';
import { isDbConnected } from '../db/connection.mjs';
import { AppError } from '../middleware/error-handler.mjs';

async function _getMongoUser(reqUser) {
    if (!isDbConnected()) return null;
    try {
        let user = null;
        if (reqUser.clerkUserId) {
            user = await User.findOne({ clerkUserId: reqUser.clerkUserId });
        }
        if (!user && reqUser.id && reqUser.id.length === 24) {
            user = await User.findById(reqUser.id).catch(() => null);
        }
        if (!user && reqUser.email) {
            user = await User.findOne({ email: reqUser.email });
        }
        if (!user && (reqUser.clerkUserId || reqUser.email)) {
            user = await User.create({
                clerkUserId: reqUser.clerkUserId || reqUser.id,
                email: reqUser.email || `${reqUser.clerkUserId}@clerk.user`,
                name: reqUser.name || '',
            }).catch(() => null);
        }
        return user;
    } catch (err) {
        console.warn('[DB] _getMongoUser lookup failed:', err.message);
        return null;
    }
}

export async function subscribe(req, res) {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
        throw new AppError('Invalid push subscription payload', 400);
    }

    const user = await _getMongoUser(req.user);
    if (!user) {
        throw new AppError('User record not found for push subscription', 400);
    }

    const userAgent = req.headers['user-agent'] || '';

    const subscription = await PushSubscription.findOneAndUpdate(
        { endpoint },
        {
            userId: user._id,
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
