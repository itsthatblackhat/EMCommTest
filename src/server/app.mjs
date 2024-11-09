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
import { queryAI } from '../models/ai.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client')));
app.use(simulateLatency);
app.use(throttleBandwidth);
app.use('/', router);

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.simulationSettings = {
        latency: 60000, // Default latency
        bandwidth: 4000 // Default bandwidth in kbps
    };

    socket.on('updateSettings', (settings) => {
        socket.simulationSettings = settings;
        console.log(`Settings updated for ${socket.id}:`, settings);
    });

    socket.on('sendAIQuery', async (data, callback) => {
        const { message, destination, latency, bandwidth } = data;
        console.log('Received AI query:', message);

        // Use the latency and bandwidth settings from the client or fallback to defaults
        const queryLatency = latency || socket.simulationSettings.latency;
        const queryBandwidth = bandwidth || socket.simulationSettings.bandwidth;

        const prompt = `
    Given the following parameters:
    - Message: "${message}"
    - Latency (one-way): ${queryLatency} ms
    - Bandwidth: ${queryBandwidth} kbps
    - Destination: ${destination}

    Calculate the estimated total transmission time from the origin to the destination and back, including any necessary data transmission time. Please respond in a JSON format:

    {
        "TimeEstimate": <estimated transmission time in milliseconds>
    }
    `;

        console.log('Sending query to AI:', prompt);

        setTimeout(async () => {
            const aiResponse = await queryAI(prompt);
            console.log('Received response from AI:', aiResponse);

            if (aiResponse.success) {
                // Ensure aiResponse.data is a string before using replace
                const aiData = aiResponse.data;

                if (typeof aiData === 'string') {
                    const cleanResponse = aiData.replace(/```json\n?|\n?```/g, '').trim();
                    let timeEstimate = JSON.parse(cleanResponse).TimeEstimate || 0;

                    // Emit an event to update the client's UI with the calculated time
                    io.emit('aiResponse', { success: true, data: `TimeEstimate:${timeEstimate}` });

                    callback({ success: true, data: `TimeEstimate:${timeEstimate}` });
                } else {
                    console.error('AI response data is not a string:', aiData);
                    io.emit('aiResponse', { success: false, message: 'Invalid AI response format' });
                    callback({ success: false, message: 'Invalid AI response format' });
                }
            } else {
                console.error('AI query failed:', aiResponse.message);
                io.emit('aiResponse', { success: false, message: aiResponse.message });
                callback({ success: false, message: aiResponse.message });
            }
            console.log('AI response processed');
        }, queryLatency);
    });

    socket.on('sendImage', (data, callback) => {
        const latency = socket.simulationSettings.latency;
        const bandwidth = socket.simulationSettings.bandwidth;
        const imagePath = path.join(__dirname, '../client/images/dogmeme.png');

        fs.readFile(imagePath, (err, imageBuffer) => {
            if (err) {
                return callback({ success: false, message: 'Failed to read image' });
            }

            const transferTime = (imageBuffer.length / ((bandwidth * 1000) / 8)) * 1000; // Convert bandwidth to bytes per second
            setTimeout(() => {
                callback({ success: true, data: imageBuffer.toString('base64') });
            }, latency + transferTime);
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});