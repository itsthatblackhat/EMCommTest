// latency.mjs

export function simulateLatency(req, res, next) {
    // Exclude /favicon.ico and static assets from latency simulation
    if (req.url === '/favicon.ico' || req.url.startsWith('/images/')) {
        return next();
    }

    const defaultLatency = 60000; // Default latency in ms
    const latency = parseInt(req.query.latency, 10) || defaultLatency;
    console.log(`Simulating latency of ${latency} ms for ${req.method} ${req.url}`);
    setTimeout(next, latency);
}
