import config from '../config/index.mjs';

const requestStore = new Map();

// Cleanup stale entries every 2 minutes to prevent memory growth
setInterval(() => {
    const now = Date.now();
    for (const [ip, requests] of requestStore) {
        const active = requests.filter(ts => now - ts < config.rateLimit.windowMs);
        if (active.length === 0) {
            requestStore.delete(ip);
        } else {
            requestStore.set(ip, active);
        }
    }
}, 2 * 60 * 1000);

export function createRateLimiter(maxRequests) {
    return (req, res, next) => {
        const ip = req.ip || req.connection?.remoteAddress || 'unknown';
        const key = `${ip}:${maxRequests}`; // Separate buckets per limit tier
        const now = Date.now();
        const windowMs = config.rateLimit.windowMs;

        let requests = requestStore.get(key) || [];
        requests = requests.filter(ts => now - ts < windowMs);

        if (requests.length >= maxRequests) {
            const retryAfter = Math.ceil((requests[0] + windowMs - now) / 1000);
            res.set('Retry-After', String(retryAfter));
            return res.status(429).json({
                error: 'Too many requests, please try again later.',
                retryAfterSeconds: retryAfter,
            });
        }

        requests.push(now);
        requestStore.set(key, requests);

        // Set rate limit headers
        res.set('X-RateLimit-Limit', String(maxRequests));
        res.set('X-RateLimit-Remaining', String(maxRequests - requests.length));

        next();
    };
}

export const authLimiter = createRateLimiter(config.rateLimit.auth);
export const dataLimiter = createRateLimiter(config.rateLimit.data);
export const scanLimiter = createRateLimiter(config.rateLimit.scan);
export const generalLimiter = createRateLimiter(config.rateLimit.general);
