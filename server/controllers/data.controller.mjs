import UserData from '../db/models/UserData.mjs';
import User from '../db/models/User.mjs';
import { isDbConnected } from '../db/connection.mjs';
import { AppError } from '../middleware/error-handler.mjs';

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

    const userData = await UserData.findOne({ userId: req.user.id });

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
            },
        });
    }

    res.json({ data: { ...EMPTY_DATA } });
}

export async function saveUserData(req, res) {
    if (!isDbConnected()) {
        throw new AppError('Database is temporarily unavailable', 503);
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
            await User.findByIdAndUpdate(req.user.id, { $set: profileUpdate });
        }
    }

    await UserData.findOneAndUpdate(
        { userId: req.user.id },
        { $set: { ...payload, lastSyncedAt: new Date() } },
        { upsert: true, returnDocument: 'after' }
    );

    res.json({ message: 'Data saved successfully' });
}
