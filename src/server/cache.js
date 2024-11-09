const LRU = require('lru-cache');

// Initialize LRU cache with a maximum of 500 items, with a TTL of 10 minutes
const cache = new LRU({
    max: 500,
    maxAge: 1000 * 60 * 10 // 10 minutes
});

/**
 * Get an item from the cache
 * @param {string} key - The key to look up
 * @returns {*} The cached value or undefined if not found
 */
function get(key) {
    return cache.get(key);
}

/**
 * Set an item in the cache
 * @param {string} key - The key to store
 * @param {*} value - The value to cache
 */
function set(key, value) {
    cache.set(key, value);
}

/**
 * Remove an item from the cache
 * @param {string} key - The key to remove
 */
function remove(key) {
    cache.delete(key);
}

/**
 * Clear the entire cache
 */
function clear() {
    cache.reset();
}

module.exports = {
    get,
    set,
    remove,
    clear
};