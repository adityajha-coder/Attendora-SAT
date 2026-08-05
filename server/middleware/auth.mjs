import jwt from 'jsonwebtoken';
import { getAuth } from '@clerk/express';
import config from '../config/index.mjs';

export function authenticateToken(req, res, next) {
    // 1. Check if Clerk authenticated the request
    let auth = null;
    try {
        if (typeof req.auth === 'function') {
            auth = req.auth();
        } else if (req.auth && typeof req.auth === 'object') {
            auth = req.auth;
        } else {
            auth = getAuth(req);
        }
    } catch (err) {
        auth = null;
    }

    if (auth && auth.userId) {
        const email = auth.sessionClaims?.email ||
                      auth.claims?.email ||
                      auth.sessionClaims?.email_address ||
                      auth.sessionClaims?.primary_email_address ||
                      '';
        const name = auth.sessionClaims?.name ||
                     auth.claims?.name ||
                     (auth.sessionClaims?.first_name ? `${auth.sessionClaims.first_name} ${auth.sessionClaims.last_name || ''}`.trim() : '') ||
                     '';
        req.user = {
            id: auth.userId,
            email: email,
            name: name,
            clerkUserId: auth.userId
        };
        return next();
    }

    // 2. Fallback to legacy JWT token (Bearer header or cookie)
    const authHeader = req.headers['authorization'];
    const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;
    const tokenFromCookie = req.cookies?.attendora_token;
    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded;
        next();
    } catch (err) {
        // Clear stale/invalid cookie so it doesn't cause repeated failures
        if (tokenFromCookie) {
            res.clearCookie('attendora_token');
        }
        return res.status(401).json({ error: 'Token expired or invalid, please sign in again' });
    }
}

// Generate a signed JWT token for a user
export function generateToken(userData) {
    return jwt.sign(
        { id: userData.id, email: userData.email, name: userData.name },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
    );
}

// Set the authentication cookie on the response
export function setAuthCookie(res, token) {
    res.cookie('attendora_token', token, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: 'lax',
        maxAge: config.cookieMaxAge,
    });
}
