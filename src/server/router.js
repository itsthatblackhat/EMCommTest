const express = require('express');
const router = express.Router();
const cache = require('./cache');
const ai = require('./ai');

router.use((req, res, next) => {
    const key = req.originalUrl || req.url;
    const cachedData = cache.get(key);
    if (cachedData) {
        res.set('X-Cache', 'HIT');
        return res.send(cachedData);
    }
    res.set('X-Cache', 'MISS');
    next();
});

router.get('/data', (req, res) => {
    const data = { message: 'Hello from Earth!', timestamp: new Date() };
    cache.set(req.originalUrl, data);
    res.json(data);
});

router.post('/data', (req, res) => {
    const data = req.body;
    res.status(201).json({ status: 'Data received', data: data });
});

router.delete('/data/:id', (req, res) => {
    const key = `/data/${req.params.id}`;
    cache.remove(key);
    res.json({ status: 'Resource cache invalidated' });
});

// New route for AI query
router.post('/ai-query', async (req, res) => {
    const query = req.body.query;
    try {
        const result = await ai.batchData(query);
        cache.set(req.originalUrl + JSON.stringify(query), result); // Cache the result for future queries if desired
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;