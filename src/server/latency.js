/**
 * Middleware to simulate Mars-Earth latency
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {function} next - Next middleware function in Express
 */
function simulateLatency(req, res, next) {
    // Simulate average one-way trip between Mars and Earth with some variance
    const minLatency = 3 * 60 * 1000; // 3 minutes in milliseconds
    const maxLatency = 22 * 60 * 1000; // 22 minutes in milliseconds
    const delay = Math.floor(Math.random() * (maxLatency - minLatency + 1)) + minLatency;

    setTimeout(() => {
        console.log(`Simulated latency for request ${req.url}: ${delay / 1000} seconds`);
        next();
    }, delay);
}

module.exports = simulateLatency;