// router.mjs

import express from 'express';
import * as cache from './cache.mjs';
import { batchData } from '../models/ai.mjs';

const router = express.Router();

router.use((req, res, next) => {
    console.log(`Checking cache for ${req.originalUrl}`);
    const key = req.originalUrl || req.url;
    const cachedData = cache.get(key);
    if (cachedData) {
        res.set('X-Cache', 'HIT');
        console.log('Cache hit for:', key);
        return res.json(cachedData);
    }
    res.set('X-Cache', 'MISS');
    console.log('Cache miss for:', key);
    next();
});

router.get('/data', (req, res) => {
    const data = { message: 'Hello from Earth!', timestamp: new Date() };
    cache.set(req.originalUrl, data);
    console.log(`Sending data:`, data);
    res.json(data);
});

router.post('/data', (req, res) => {
    const data = req.body;
    console.log(`Received data:`, data);
    res.status(201).json({ status: 'Data received', data: data });
});

router.delete('/data/:id', (req, res) => {
    const key = `/data/${req.params.id}`;
    cache.remove(key);
    console.log(`Deleted cache for: ${key}`);
    res.json({ status: 'Resource cache invalidated' });
});

router.post('/ai-query', async (req, res) => {
    const query = req.body.query;
    console.log(`AI Query initiated:`, query);
    try {
        const result = await batchData(query);
        cache.set(req.originalUrl + JSON.stringify(query), result);
        console.log('AI Query result:', result);
        res.json(result);
    } catch (error) {
        console.error(`AI Query error:`, error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
