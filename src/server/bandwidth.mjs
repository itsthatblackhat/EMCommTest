// bandwidth.mjs

export function throttleBandwidth(req, res, next) {
    const originalWrite = res.write;
    const originalEnd = res.end;

    const chunks = [];
    let sent = 0;

    res.write = function(chunk, encoding, callback) {
        chunks.push(chunk);
        return true;
    };

    res.end = function(chunk, encoding, callback) {
        if (chunk) chunks.push(chunk);

        const sendChunk = () => {
            if (chunks.length > 0) {
                const chunk = chunks.shift();
                sent += chunk.length;
                originalWrite.call(res, chunk, encoding, sendChunk);
            } else {
                originalEnd.call(res);
            }
        };

        const interval = setInterval(() => {
            if (chunks.length > 0) {
                sendChunk();
            } else {
                clearInterval(interval);
            }
        }, 50);

        if (chunks.length > 0) sendChunk();
    };

    next();
}
