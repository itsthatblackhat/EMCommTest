// bandwidth.mjs

export function throttleBandwidth(req, res, next) {
    // Exclude /favicon.ico and static assets from bandwidth throttling
    if (req.url === '/favicon.ico' || req.url.startsWith('/images/')) {
        return next();
    }

    const defaultBandwidthKbps = 4000; // Default bandwidth in kbps
    const bandwidthKbps = parseInt(req.query.bandwidth, 10) || defaultBandwidthKbps;
    const bytesPerSecond = (bandwidthKbps * 1000) / 8;

    let totalBytesSent = 0;
    const chunks = [];

    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);

    res.write = function(chunk, encoding, callback) {
        chunks.push({ chunk, encoding });
        return true;
    };

    res.end = function(chunk, encoding, callback) {
        if (chunk) {
            chunks.push({ chunk, encoding });
        }

        const sendChunks = () => {
            if (chunks.length === 0) {
                originalEnd();
                return;
            }

            const { chunk, encoding } = chunks.shift();
            totalBytesSent += chunk.length;
            const delay = (chunk.length / bytesPerSecond) * 1000;

            setTimeout(() => {
                originalWrite(chunk, encoding, () => {
                    sendChunks();
                });
            }, delay);
        };

        sendChunks();
    };

    console.log(`Throttling bandwidth for ${req.method} ${req.url}: ${bandwidthKbps} kbps`);
    next();
}
