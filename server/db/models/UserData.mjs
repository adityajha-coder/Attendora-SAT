import mongoose from 'mongoose';

const UserDataSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    schedule:      { type: mongoose.Schema.Types.Mixed, default: [] },
    history:       { type: mongoose.Schema.Types.Mixed, default: [] },
    assignments:   { type: mongoose.Schema.Types.Mixed, default: [] },
    gpaCourses:    { type: mongoose.Schema.Types.Mixed, default: [] },
    archivedTerms: { type: mongoose.Schema.Types.Mixed, default: [] },
    achievements:  { type: mongoose.Schema.Types.Mixed, default: {} },
    settings:      { type: mongoose.Schema.Types.Mixed, default: {} },
    lastSyncedAt:  { type: Date, default: Date.now },
}, {
    timestamps: true,
});


const UserData = mongoose.model('UserData', UserDataSchema);

export default UserData;
