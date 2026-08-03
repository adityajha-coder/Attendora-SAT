import jwt from 'jsonwebtoken';
import config from '../config/index.mjs';

export function authenticateToken(req, res, next) {
    // 1. Check if Clerk authenticated the request
    if (req.auth && req.auth.userId) {
        req.user = {
            id: req.auth.userId,
            email: req.auth.sessionClaims?.email || req.auth.claims?.email || '',
            name: req.auth.sessionClaims?.name || req.auth.claims?.name || '',
            clerkUserId: req.auth.userId
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
