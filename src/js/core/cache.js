// cache for attendance cal.

let _lastCacheVersion = -1;
const _cache = new Map();

export function getCached(key, version) {
    if (version !== _lastCacheVersion) {
        _cache.clear();
        _lastCacheVersion = version;
    }
    return _cache.get(key);
}

export function setCached(key, value, version) {
    if (version !== _lastCacheVersion) {
        _cache.clear();
        _lastCacheVersion = version;
    }
    _cache.set(key, value);
    return value;
}

export function invalidateCache() {
    _cache.clear();
    _lastCacheVersion = -1;
}
