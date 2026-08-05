import UserData from '../db/models/UserData.mjs';
import User from '../db/models/User.mjs';
import { isDbConnected } from '../db/connection.mjs';
import { AppError } from '../middleware/error-handler.mjs';
import { findOrCreateMongoUser } from '../services/user-lookup.service.mjs';

const EMPTY_DATA = {
    schedule: [],
    history: [],
    assignments: [],
    gpaCourses: [],
    archivedTerms: [],
    achievements: {},
    settings: {},
};

export async function getUserData(req, res) {
    if (!isDbConnected()) {
        throw new AppError('Database is temporarily unavailable', 503);
    }

    const user = await findOrCreateMongoUser(req.user);
    if (!user) {
        return res.json({ data: { ...EMPTY_DATA, userProfile: { name: req.user.name || '', contact: req.user.email || '' } } });
    }

    const userData = await UserData.findOne({ userId: user._id });

    const userProfile = {
        name: user.name || req.user.name || '',
        contact: user.email || user.contact || req.user.email || '',
        course: user.course || '',
        year: user.year || '',
    };

    if (userData) {
        return res.json({
            data: {
                schedule: userData.schedule || [],
                history: userData.history || [],
                assignments: userData.assignments || [],
                gpaCourses: userData.gpaCourses || [],
                archivedTerms: userData.archivedTerms || [],
                achievements: userData.achievements || {},
                settings: userData.settings || {},
                userProfile: userProfile,
            },
        });
    }

    res.json({ data: { ...EMPTY_DATA, userProfile } });
}

export async function saveUserData(req, res) {
    if (!isDbConnected()) {
        throw new AppError('Database is temporarily unavailable', 503);
    }

    const user = await findOrCreateMongoUser(req.user);
    if (!user) {
        throw new AppError('User record could not be found or created', 400);
    }

    const { schedule, history, assignments, gpaCourses, archivedTerms, achievements, settings, userProfile } = req.body;

    const payload = {
        schedule: schedule || [],
        history: history || [],
        assignments: assignments || [],
        gpaCourses: gpaCourses || [],
        archivedTerms: archivedTerms || [],
        achievements: achievements || {},
        settings: settings || {},
    };

    if (userProfile) {
        const profileUpdate = {};
        if (userProfile.name) profileUpdate.name = userProfile.name;
        if (userProfile.course) profileUpdate.course = userProfile.course;
        if (userProfile.year) profileUpdate.year = userProfile.year;
        if (userProfile.contact) profileUpdate.contact = userProfile.contact;

        if (Object.keys(profileUpdate).length > 0) {
            await User.findByIdAndUpdate(user._id, { $set: profileUpdate }).catch(() => null);
        }
    }

    await UserData.findOneAndUpdate(
        { userId: user._id },
        { $set: { ...payload, lastSyncedAt: new Date() } },
        { upsert: true, returnDocument: 'after' }
    );

    res.json({ message: 'Data saved successfully' });
}
