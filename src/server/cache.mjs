// cache.mjs

const cache = new Map();

export function get(key) {
    return cache.get(key);
}

export function set(key, value) {
    cache.set(key, value);
}

export function remove(key) {
    cache.delete(key);
}

export function clear() {
    cache.clear();
}
