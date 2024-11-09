// latency.mjs

export function simulateLatency(req, res, next) {
    const delay = Math.floor(Math.random() * (1200000 - 60000)) + 60000; // Between 1 and 20 minutes
    console.log(`Simulating latency of ${delay} ms for ${req.method} ${req.url}`);
    setTimeout(next, delay);
}
