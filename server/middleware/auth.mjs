import jwt from 'jsonwebtoken';
import config from '../config/index.mjs';

export function authenticateToken(req, res, next) {
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
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired, please sign in again' });
        }
        return res.status(403).json({ error: 'Invalid or expired token' });
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
