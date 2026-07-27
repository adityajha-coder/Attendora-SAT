import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true },
    email:    { type: String, required: true, unique: true },
    name:     { type: String, default: '' },
    course:   { type: String, default: '' },
    year:     { type: String, default: '' },
    contact:  { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
}, {
    timestamps: true,
});


const User = mongoose.model('User', UserSchema);

export default User;
