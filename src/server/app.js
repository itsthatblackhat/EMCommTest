const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const simulateLatency = require('./latency');
const throttleBandwidth = require('./bandwidth');
const cache = require('./cache');
const router = require('./router');
const ai = require('./ai'); // Import AI functionality

// Apply middleware
app.use(simulateLatency);
app.use(throttleBandwidth);

// Use router for routes
app.use('/', router);

// Socket.IO setup for real-time features
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle AI query through socket
    socket.on('aiQuery', async (query, callback) => {
        try {
            const result = await ai.batchData(query);
            callback({ success: true, data: result });
        } catch (error) {
            callback({ success: false, message: error.message });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});