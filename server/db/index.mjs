import mongoose from 'mongoose';

// User Schema Definition
const UserSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, default: '' },
    course: { type: String, default: '' },
    year: { type: String, default: '' },
    contact: { type: String, default: '' },
    avatarUrl: { type: String, default: '' }
}, { timestamps: true });

// User Data Document Schema (Stores schedule, history, assignments, GPA, etc)
const UserDataSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    schedule: { type: mongoose.Schema.Types.Mixed, default: [] },
    history: { type: mongoose.Schema.Types.Mixed, default: [] },
    assignments: { type: mongoose.Schema.Types.Mixed, default: [] },
    gpaCourses: { type: mongoose.Schema.Types.Mixed, default: [] },
    archivedTerms: { type: mongoose.Schema.Types.Mixed, default: [] },
    achievements: { type: mongoose.Schema.Types.Mixed, default: {} },
    settings: { type: mongoose.Schema.Types.Mixed, default: {} },
    lastSyncedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);
export const UserData = mongoose.model('UserData', UserDataSchema);

export async function initDatabase() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendora';
        await mongoose.connect(mongoUri);
        console.log('[DB] Connected successfully to MongoDB database via Mongoose.');
    } catch (err) {
        console.error('[DB] Failed to connect to MongoDB database:', err.message);
    }
}
