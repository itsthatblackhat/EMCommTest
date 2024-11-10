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
        bandwidth: 4000, // Default bandwidth in kbps
        lastSyncTime: new Date() // Stores the last time Earth and Mars were in sync
    };

    socket.on('updateSettings', (settings) => {
        socket.simulationSettings = { ...socket.simulationSettings, ...settings };
        console.log(`Settings updated for ${socket.id}:`, settings);
    });

    socket.on('sendAIQuery', async (data, callback) => {
        const { message, destination, latency, bandwidth } = data;
        console.log('Received AI query:', message);

        // Calculate the current time difference due to Martian day length
        const solsSinceLastSync = Math.floor((new Date() - socket.simulationSettings.lastSyncTime) / (24 * 3600 * 1000 + 40 * 60 * 1000));
        const earthToMarsTimeDifference = solsSinceLastSync * 40 * 60 * 1000; // Difference in milliseconds

        // Use these settings for the simulation
        const queryLatency = latency || socket.simulationSettings.latency;
        const queryBandwidth = bandwidth || socket.simulationSettings.bandwidth;

        const prompt = `
    Given the following parameters:
    - Message: "${message}"
    - Latency (one-way): ${queryLatency} ms
    - Bandwidth: ${queryBandwidth} kbps
    - Destination: ${destination}
    - Time Difference: ${earthToMarsTimeDifference} ms

    Calculate the estimated total transmission time from the origin to the destination and back, including any necessary data transmission time. Please respond in a JSON format:

    {
        "TimeEstimate": <estimated transmission time in milliseconds>
    }
    `;

        console.log('Sending query to AI:', prompt);

        const distanceToDestination = {
            'Mars': 54.6 * 1e6, // Distance to Mars in kilometers at closest approach
            'Moon': 0.384 * 1e6, // Distance to Moon
            'Earth': 0 // Assuming the message stays on Earth
        };

        const speedOfLight = 299792; // km/s

        setTimeout(async () => {
            const aiResponse = await queryAI(prompt);
            console.log('Received response from AI:', aiResponse);

            if (aiResponse.success) {
                const aiData = aiResponse.data;

                if (typeof aiData === 'string') {
                    const jsonMatch = aiData.match(/```json([\s\S]*?)```/);
                    if (jsonMatch && jsonMatch[1]) {
                        const cleanResponse = jsonMatch[1].trim();
                        try {
                            const parsedResponse = JSON.parse(cleanResponse);
                            let timeEstimate = parsedResponse.TimeEstimate || 0;
                            let distance = distanceToDestination[destination] || 0;

                            // Adjusting for Mars' longer day
                            timeEstimate += earthToMarsTimeDifference;

                            // Ensuring we don't exceed the speed of light
                            let speed = distance / (timeEstimate / 2000); // Speed in km/s, half the time for one way
                            if(speed > speedOfLight) {
                                speed = speedOfLight;
                                // Recalculate time estimate to be realistic
                                timeEstimate = Math.round((distance / speedOfLight) * 2 * 1000); // Time for round trip in ms
                            }

                            // Emit an event to update the client's UI with the calculated data
                            io.emit('aiResponse', {
                                success: true,
                                data: {
                                    timeEstimate: timeEstimate,
                                    distance: distance,
                                    speed: speed,
                                    solsDifference: solsSinceLastSync
                                }
                            });

                            callback({
                                success: true,
                                data: {
                                    timeEstimate: timeEstimate,
                                    distance: distance,
                                    speed: speed,
                                    solsDifference: solsSinceLastSync
                                }
                            });
                        } catch (error) {
                            console.error('Error parsing JSON:', error);
                            io.emit('aiResponse', { success: false, message: 'Error parsing AI response' });
                            callback({ success: false, message: 'Error parsing AI response' });
                        }
                    } else {
                        console.error('Could not extract JSON from AI response:', aiData);
                        io.emit('aiResponse', { success: false, message: 'Invalid AI response format' });
                        callback({ success: false, message: 'Invalid AI response format' });
                    }
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

            // Update the last sync time for the next query
            socket.simulationSettings.lastSyncTime = new Date();
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

            // Calculate the time to transfer the image data
            const transferTime = (imageBuffer.length * 8) / (bandwidth * 1000); // Converting bytes to bits and then to ms
            const totalTime = latency + transferTime;

            setTimeout(() => {
                callback({ success: true, data: imageBuffer.toString('base64') });
            }, totalTime);
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