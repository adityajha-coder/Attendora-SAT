import mongoose from 'mongoose';

const PushSubscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    endpoint: {
        type: String,
        required: true,
        unique: true,
    },
    keys: {
        p256dh: { type: String, required: true },
        auth:   { type: String, required: true },
    },
    userAgent: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

const PushSubscription = mongoose.model('PushSubscription', PushSubscriptionSchema);

export default PushSubscription;
