import User from '../db/models/User.mjs';
import UserData from '../db/models/UserData.mjs';
import { verifyGoogleToken } from '../services/google-auth.service.mjs';
import { generateToken, setAuthCookie } from '../middleware/auth.mjs';
import { isDbConnected } from '../db/connection.mjs';
import { AppError } from '../middleware/error-handler.mjs';

export async function googleLogin(req, res) {
    const { credential, idToken } = req.body;
    const tokenToVerify = credential || idToken;

    if (!tokenToVerify) {
        throw new AppError('Google credential/token is required', 400);
    }

    const googleUser = await verifyGoogleToken(tokenToVerify);

    let userData = {
        id: googleUser.googleId || googleUser.email,
        googleId: googleUser.googleId,
        email: googleUser.email,
        name: googleUser.name,
        avatarUrl: googleUser.picture,
    };

    if (isDbConnected()) {
        try {
            let user = await User.findOne({ email: googleUser.email });

            if (!user) {
                user = await User.create({
                    googleId: googleUser.googleId,
                    email: googleUser.email,
                    name: googleUser.name,
                    avatarUrl: googleUser.picture,
                });
            } else {
                if (googleUser.googleId) user.googleId = googleUser.googleId;
                if (googleUser.name && !user.name) user.name = googleUser.name;
                if (googleUser.picture) user.avatarUrl = googleUser.picture;
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
                avatarUrl: user.avatarUrl || '',
            };
        } catch (dbErr) {
            console.warn('[Auth] MongoDB write skipped:', dbErr.message);
        }
    }

    const jwtToken = generateToken(userData);
    setAuthCookie(res, jwtToken);

    res.json({
        message: 'Authentication successful',
        token: jwtToken,
        user: userData,
    });
}

export async function googleCallback(req, res) {
    const credential = req.body?.credential || req.query?.credential;
    if (!credential) {
        return res.redirect('/?error=no_credential');
    }

    try {
        const googleUser = await verifyGoogleToken(credential);

        let userData = {
            id: googleUser.googleId || googleUser.email,
            googleId: googleUser.googleId,
            email: googleUser.email,
            name: googleUser.name,
            avatarUrl: googleUser.picture,
        };

        if (isDbConnected()) {
            try {
                let user = await User.findOne({ email: googleUser.email });

                if (!user) {
                    user = await User.create({
                        googleId: googleUser.googleId,
                        email: googleUser.email,
                        name: googleUser.name,
                        avatarUrl: googleUser.picture,
                    });
                } else {
                    if (googleUser.googleId) user.googleId = googleUser.googleId;
                    if (googleUser.name && !user.name) user.name = googleUser.name;
                    if (googleUser.picture) user.avatarUrl = googleUser.picture;
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
                    avatarUrl: user.avatarUrl || '',
                };
            } catch (dbErr) {
                console.warn('[Auth] MongoDB write skipped:', dbErr.message);
            }
        }

        const jwtToken = generateToken(userData);
        setAuthCookie(res, jwtToken);

        return res.redirect('/');
    } catch (err) {
        console.error('[Auth] Google callback error:', err.message);
        return res.redirect('/?error=' + encodeURIComponent(err.message));
    }
}

export async function getCurrentUser(req, res) {
    if (isDbConnected()) {
        try {
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
                        avatarUrl: user.avatarUrl,
                    },
                });
            }
        } catch (err) {}
    }

    res.json({
        user: {
            id: req.user.id,
            email: req.user.email,
            name: req.user.name,
        },
    });
}

export function logout(req, res) {
    res.clearCookie('attendora_token');
    res.json({ message: 'Logged out successfully' });
}
