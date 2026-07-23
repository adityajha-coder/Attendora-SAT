module.exports = function handler(request, response) {
    const config = {
        googleClientId: process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '',
        vapidPublicKey: process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY || ''
    };

    return response.status(200).json(config);
};
