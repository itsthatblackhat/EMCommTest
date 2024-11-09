const {RateLimiterMemory} = require('rate-limiter-flexible');

// Initialize rate limiter for bandwidth simulation
const rateLimiter = new RateLimiterMemory({
    points: 100, // Number of points allowed per duration
    duration: 1, // Duration in seconds
});

let currentBandwidth = 100; // Initial bandwidth in kb/s

/**
 * Middleware function to throttle bandwidth
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
module.exports = function throttleBandwidth(req, res, next) {
    const key = req.ip; // Use IP for rate limiting, you might want to use a more unique identifier in production

    rateLimiter.consume(key)
        .then(() => {
            // Throttle the response if the bandwidth limit is reached
            res.on('finish', () => {
                if(res.statusCode === 200) { // Only throttle successful responses
                    const responseSize = res.get('Content-Length');
                    if (responseSize > currentBandwidth * 1024) { // Convert to bytes
                        const delay = (responseSize - (currentBandwidth * 1024)) / currentBandwidth;
                        console.log(`Delaying response by ${delay} seconds due to bandwidth limitation`);
                        setTimeout(() => {
                            next();
                        }, delay * 1000);
                        return;
                    }
                }
                next();
            });
            next();
        })
        .catch((rejRes) => {
            // If rate limit is exceeded, delay the response
            console.log(`Rate limit exceeded. Delaying by ${rejRes.msBeforeNext / 1000} seconds`);
            setTimeout(next, rejRes.msBeforeNext);
        });
};

/**
 * Function to update the simulated bandwidth
 * @param {number} bandwidth - Bandwidth in kb/s
 */
module.exports.setBandwidth = function(bandwidth) {
    currentBandwidth = bandwidth;
};