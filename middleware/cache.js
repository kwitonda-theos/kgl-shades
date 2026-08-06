const NodeCache = require('node-cache');

// ── Singleton Cache Instance ───────────────────────────────────
// stdTTL  = default time-to-live in seconds (5 minutes)
// checkperiod = how often expired keys are purged (every 60s)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// ── getOrSet ───────────────────────────────────────────────────
// Returns cached value for `key` if it exists and is fresh.
// Otherwise calls `fetchFn()`, stores the result, and returns it.
//
// @param {string}   key      - Cache key (e.g. "products:all")
// @param {Function} fetchFn  - Async function that fetches data from DB
// @param {number}   [ttl]    - Optional override TTL in seconds
// @returns {Promise<any>}
const getOrSet = async (key, fetchFn, ttl) => {
    const cached = cache.get(key);
    if (cached !== undefined) {
        return { data: cached, fromCache: true };
    }

    const freshData = await fetchFn();
    cache.set(key, freshData, ttl || 0); // 0 = use default stdTTL
    return { data: freshData, fromCache: false };
};

// ── invalidatePrefix ───────────────────────────────────────────
// Deletes all cache keys that start with the given prefix.
// Use after any mutation (POST/PUT/DELETE) to keep cache in sync.
//
// @param {string} prefix - Key prefix to match (e.g. "products:")
const invalidatePrefix = (prefix) => {
    const keys = cache.keys();
    const toDelete = keys.filter((k) => k.startsWith(prefix));
    if (toDelete.length > 0) {
        cache.del(toDelete);
    }
};

// ── invalidateKeys ─────────────────────────────────────────────
// Deletes multiple specific cache keys.
//
// @param {string[]} keys - Array of exact cache keys to delete
const invalidateKeys = (keys) => {
    cache.del(keys);
};

// ── getStats ───────────────────────────────────────────────────
// Returns cache hit/miss statistics for monitoring.
const getStats = () => cache.getStats();

module.exports = {
    cache,
    getOrSet,
    invalidatePrefix,
    invalidateKeys,
    getStats
};
