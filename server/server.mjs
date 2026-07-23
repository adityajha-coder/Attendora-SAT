import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import compression from 'compression';
import mongoose from 'mongoose';
import { User, UserData, initDatabase } from './db/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const PORT = process.env.PORT || 3010;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_attendora_jwt_secret_key_2026';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
const app = express();

app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
initDatabase();

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const tokenFromHeader = authHeader && authHeader.split(' ')[1];
    const tokenFromCookie = req.cookies?.attendora_token;
    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

app.get('/api/config', (req, res) => {
    res.json({
        googleClientId: GOOGLE_CLIENT_ID || '',
        vapidPublicKey: process.env.VITE_VAPID_PUBLIC_KEY || ''
    });
});

app.post('/api/auth/google', async (req, res) => {
    try {
        const { credential, idToken } = req.body;
        const tokenToVerify = credential || idToken;

        if (!tokenToVerify) {
            return res.status(400).json({ error: 'Google credential/token is required' });
        }

        let payload;
        try {
            if (GOOGLE_CLIENT_ID) {
                const ticket = await googleClient.verifyIdToken({
                    idToken: tokenToVerify,
                    audience: GOOGLE_CLIENT_ID
                });
                payload = ticket.getPayload();
            } else {
                payload = jwt.decode(tokenToVerify);
            }
        } catch (authErr) {
            console.warn('[Auth] Google Token verification warning:', authErr.message);
            const decoded = jwt.decode(tokenToVerify);
            if (decoded && decoded.email) {
                payload = decoded;
            } else {
                return res.status(401).json({ error: 'Invalid Google credential token' });
            }
        }

        if (!payload || !payload.email) {
            return res.status(400).json({ error: 'Email not provided by Google' });
        }

        const { sub: googleId, email, name, picture } = payload;
        let userData = {
            id: googleId || email,
            googleId: googleId || '',
            email,
            name: name || '',
            avatarUrl: picture || ''
        };

        if (mongoose.connection.readyState === 1) {
            try {
                let user = await User.findOne({ email });
                if (!user) {
                    user = await User.create({
                        googleId,
                        email,
                        name: name || '',
                        avatarUrl: picture || ''
                    });
                } else {
                    if (googleId) user.googleId = googleId;
                    if (name && !user.name) user.name = name;
                    if (picture) user.avatarUrl = picture;
                    await user.save();
                }

                await UserData.findOneAndUpdate(
                    { userId: user._id },
                    { $setOnInsert: { userId: user._id } },
                    { upsert: true, returnDocument: 'after' }
                );

                userData = {
                    id: user._id.toString(),
                    googleId: user.googleId,
                    email: user.email,
                    name: user.name,
                    course: user.course || '',
                    year: user.year || '',
                    contact: user.contact || '',
                    avatarUrl: user.avatarUrl || ''
                };
            } catch (dbErr) {
                console.warn('[DB] MongoDB write skipped:', dbErr.message);
            }
        }

        // Generate 7-day JWT token
        const jwtToken = jwt.sign(
            { id: userData.id, email: userData.email, name: userData.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('attendora_token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            message: 'Authentication successful',
            token: jwtToken,
            user: userData
        });

    } catch (err) {
        console.error('[Auth Error]:', err);
        res.status(500).json({ error: 'Authentication failed: ' + err.message });
    }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const user = await User.findById(req.user.id);
            if (user) {
                return res.json({
                    user: {
                        id: user._id,
                        googleId: user.googleId,
                        email: user.email,
                        name: user.name,
                        course: user.course,
                        year: user.year,
                        contact: user.contact,
                        avatarUrl: user.avatarUrl
                    }
                });
            }
        }
        res.json({
            user: {
                id: req.user.id,
                email: req.user.email,
                name: req.user.name
            }
        });
    } catch (err) {
        res.json({
            user: {
                id: req.user.id,
                email: req.user.email,
                name: req.user.name
            }
        });
    }
});

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('attendora_token');
    res.json({ message: 'Logged out successfully' });
});

const memoryDataStore = new Map();

app.get('/api/data', authenticateToken, async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
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
                        settings: userData.settings || {}
                    }
                });
            } else {
                return res.json({
                    data: {
                        schedule: [],
                        history: [],
                        assignments: [],
                        archivedTerms: [],
                        settings: {}
                    }
                });
            }
        }

        const fallback = memoryDataStore.get(req.user.id);
        res.json({ data: fallback || null });
    } catch (err) {
        console.error('[Get Data Error]:', err);
        const fallback = memoryDataStore.get(req.user.id);
        res.json({ data: fallback || null });
    }
});

app.put('/api/data', authenticateToken, async (req, res) => {
    try {
        const { schedule, history, assignments, gpaCourses, archivedTerms, achievements, settings, userProfile } = req.body;
        const payload = {
            schedule: schedule || [],
            history: history || [],
            assignments: assignments || [],
            gpaCourses: gpaCourses || [],
            archivedTerms: archivedTerms || [],
            achievements: achievements || {},
            settings: settings || {}
        };

        memoryDataStore.set(req.user.id, payload);

        if (mongoose.connection.readyState === 1) {
            try {
                if (userProfile) {
                    await User.findByIdAndUpdate(req.user.id, {
                        $set: {
                            ...(userProfile.name && { name: userProfile.name }),
                            ...(userProfile.course && { course: userProfile.course }),
                            ...(userProfile.year && { year: userProfile.year }),
                            ...(userProfile.contact && { contact: userProfile.contact }),
                        }
                    });
                }

                await UserData.findOneAndUpdate(
                    { userId: req.user.id },
                    { $set: { ...payload, lastSyncedAt: new Date() } },
                    { upsert: true, returnDocument: 'after' }
                );
            } catch (dbErr) {
                console.warn('[DB] Save skipped:', dbErr.message);
            }
        }

        res.json({ message: 'Data saved successfully' });
    } catch (err) {
        console.error('[Save Data Error]:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/scan', async (req, res) => {
    try {
        const { base64Image } = req.body;
        const openRouterApiKey = process.env.OPENROUTER_API_KEY;

        if (!openRouterApiKey) {
            return res.status(500).json({ error: 'OPENROUTER_API_KEY is not configured in .env' });
        }

        const modelsToTry = [
            'openai/gpt-4o-mini',
            'google/gemini-1.5-flash',
            'google/gemini-2.0-flash-lite-preview-02-05:free'
        ];

        let apiResponse = null;
        let lastError = '';

        for (const model of modelsToTry) {
            try {
                const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${openRouterApiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://attendora-sat.vercel.app',
                        'X-Title': 'Attendora'
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            {
                                role: 'system',
                                content: 'You are a precise data extraction specialist. Always return data as a single raw JSON array of objects. Never include markdown code blocks, explanatory text, or any characters outside the JSON structure.'
                            },
                            {
                                role: 'user',
                                content: [
                                    {
                                        type: 'text',
                                        text: 'Extract the classes schedule from this Bhagwan Parshuram Institute of Technology (BPIT) timetable. RULES: 1. Extract EVERY SINGLE class for the entire day, from the earliest morning class to the absolute last evening class. DO NOT skip or omit any classes. 2. Map abbreviations (e.g., DS, OOPS, CM, DM, DLCD) to full names using the legend in the image provided (e.g., "Data Structure", "Computational Methods"). 3. Convert all PM times to 24-hour format (12:50-1:40 is 12:50-13:40). 4. If groups are mentioned like (G1) or (G2), include them in the name. 5. Ignore "LUNCH", "LIB", "PDP". Return ONLY a JSON array with this structure: [{"day": "Monday", "start": "09:30", "end": "10:20", "name": "Class Name", "instructor": "Instructor Name", "room": "407"}].'
                                    },
                                    {
                                        type: 'image_url',
                                        image_url: { url: base64Image }
                                    }
                                ]
                            }
                        ],
                        max_tokens: 4000
                    })
                });

                if (response.ok) {
                    apiResponse = response;
                    break;
                } else {
                    const errOutput = await response.text();
                    console.error(`Model ${model} failed:`, errOutput);
                    lastError = errOutput;
                }
            } catch (e) {
                console.error(`Fetch error for ${model}:`, e.message);
                lastError = e.message;
            }
        }

        if (!apiResponse) {
            return res.status(400).json({ error: `OpenRouter Error for all models. Last Error: ${lastError}` });
        }

        const data = await apiResponse.json();
        res.json(data);

    } catch (err) {
        console.error("API Error: ", err);
        res.status(500).json({ error: err.message });
    }
});

app.use(express.static(path.join(__dirname, '..'), {
    maxAge: '1d',
    etag: true,
    lastModified: true
}));

app.use((req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Attendora Backend Server running at http://localhost:${PORT}`);
});

export default app;
