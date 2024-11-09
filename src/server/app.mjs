// app.mjs

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { simulateLatency } from './latency.mjs';
import { throttleBandwidth } from './bandwidth.mjs';
import * as cache from './cache.mjs';
import router from './router.mjs';
import { batchData } from '../models/ai.mjs';
import morgan from 'morgan';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Use Morgan for logging HTTP requests with status codes
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

// Apply latency and bandwidth middleware
app.use(simulateLatency);
app.use(throttleBandwidth);

// Use the router for API routes
app.use('/', router);

// Socket.io setup
io.on('connection', (socket) => {
    console.log('A new client connected:', socket.id);

    socket.on('requestData', (data, callback) => {
        console.log('Received requestData event', data);
        setTimeout(() => {
            callback({ data: 'This is a delayed response from the server.' });
            console.log('Sent delayed response');
        }, 10000);
    });

    socket.on('aiQuery', async (query, callback) => {
        console.log('Received aiQuery:', query);
        try {
            const result = await batchData(query);
            callback({ success: true, data: result });
            console.log('AI query processed:', result);
        } catch (error) {
            callback({ success: false, message: error.message });
            console.error('Error processing AI query:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Remove or comment out the root route handler
// This allows express.static to serve index.html by default
// app.get('/', (req, res) => {
//     console.log('Root URL accessed');
//     res.send('EMCommTest server is running.');
// });

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).send({ error: 'An unexpected error occurred' });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
