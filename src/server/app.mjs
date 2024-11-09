// app.mjs

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { simulateLatency } from './latency.mjs';
import { throttleBandwidth } from './bandwidth.mjs';
import router from './router.mjs';
import morgan from 'morgan';
import fs from 'fs';

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

    // Default settings
    socket.simulationSettings = {
        latency: 60000,   // Default latency in ms
        bandwidth: 4000   // Default bandwidth in kbps
    };

    socket.on('updateSettings', (settings) => {
        console.log(`Updating simulation settings for ${socket.id}:`, settings);
        socket.simulationSettings = settings;
    });

    // Handle text message sending
    socket.on('sendTextMessage', (data, callback) => {
        console.log('Received text message:', data.message);
        const latency = socket.simulationSettings.latency || 60000;

        setTimeout(() => {
            callback({ success: true, data: data.message });
            console.log('Text message sent back to client.');
        }, latency);
    });

    // Handle image sending
    socket.on('sendImage', (data, callback) => {
        console.log('Client is sending an image.');
        const latency = socket.simulationSettings.latency || 60000;
        const bandwidthKbps = socket.simulationSettings.bandwidth || 4000;
        const bytesPerSecond = (bandwidthKbps * 1000) / 8;

        const imagePath = path.join(__dirname, '../client/images/dogmeme.png');
        fs.readFile(imagePath, (err, imageBuffer) => {
            if (err) {
                console.error('Error reading image file:', err);
                return callback({ success: false, message: 'Error reading image file.' });
            }

            const dataSize = imageBuffer.length;
            const transferTime = (dataSize / bytesPerSecond) * 1000; // in ms
            const totalDelay = latency + transferTime;

            console.log(`Simulating image transfer with total delay: ${totalDelay.toFixed(2)} ms`);

            setTimeout(() => {
                const imageBase64 = imageBuffer.toString('base64');
                callback({ success: true, data: imageBase64 });
                console.log('Image sent back to client.');
            }, totalDelay);
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).send({ error: 'An unexpected error occurred' });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
