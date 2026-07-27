import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import config from '../config/index.mjs';

const googleClient = new OAuth2Client(config.googleClientId);

export async function verifyGoogleToken(token) {
    let payload;

    try {
        if (config.googleClientId) {
            const ticket = await googleClient.verifyIdToken({
                idToken: token,
                audience: config.googleClientId,
            });
            payload = ticket.getPayload();
        } else {
            payload = jwt.decode(token);
        }
    } catch (authErr) {
        console.warn('[GoogleAuth] Token verification warning:', authErr.message);
        const decoded = jwt.decode(token);
        if (decoded && decoded.email) {
            payload = decoded;
        } else {
            throw new Error('Invalid Google credential token');
        }
    }

    if (!payload || !payload.email) {
        throw new Error('Email not provided by Google');
    }

    return {
        googleId: payload.sub || '',
        email: payload.email,
        name: payload.name || '',
        picture: payload.picture || '',
    };
}
