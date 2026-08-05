import User from '../db/models/User.mjs';
import { isDbConnected } from '../db/connection.mjs';

export async function findOrCreateMongoUser(reqUser) {
    if (!reqUser || !isDbConnected()) return null;
    try {
        let user = null;

        // 1. Primary lookup: clerkUserId
        if (reqUser.clerkUserId) {
            user = await User.findOne({ clerkUserId: reqUser.clerkUserId });
        }

        // 2. Secondary lookup: mongo ObjectId
        if (!user && reqUser.id && reqUser.id.length === 24) {
            user = await User.findById(reqUser.id).catch(() => null);
        }

        // 3. Fallback lookup: email (only if email is not bound to a different clerkUserId)
        if (!user && reqUser.email) {
            const emailUser = await User.findOne({ email: reqUser.email });
            if (emailUser && (!emailUser.clerkUserId || emailUser.clerkUserId === reqUser.clerkUserId)) {
                user = emailUser;
                if (reqUser.clerkUserId && !user.clerkUserId) {
                    user.clerkUserId = reqUser.clerkUserId;
                    await user.save().catch(() => null);
                }
            }
        }

        // 4. Create user if not found
        if (!user && (reqUser.clerkUserId || reqUser.email)) {
            try {
                user = await User.create({
                    clerkUserId: reqUser.clerkUserId || (reqUser.id?.startsWith('user_') ? reqUser.id : undefined),
                    email: reqUser.email || `${reqUser.clerkUserId}@clerk.user`,
                    name: reqUser.name || '',
                });
            } catch (createErr) {
                if (reqUser.clerkUserId) {
                    user = await User.findOne({ clerkUserId: reqUser.clerkUserId });
                }
                if (!user && reqUser.email) {
                    user = await User.findOne({ email: reqUser.email });
                }
            }
        }

        return user;
    } catch (err) {
        console.warn('[DB] findOrCreateMongoUser lookup failed:', err.message);
        return null;
    }
}
