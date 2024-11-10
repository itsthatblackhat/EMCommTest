document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    // Elements
    const status = document.getElementById('status');
    const sendBtn = document.getElementById('send');
    const messageInput = document.getElementById('message');
    const responseDiv = document.getElementById('response');
    const aiResponseDiv = document.getElementById('aiResponse');
    const messageProgressBar = document.getElementById('messageProgressBar');
    const messageStatsDiv = document.getElementById('messageStats');
    const destinationSelect = document.getElementById('destination');
    const latencyInput = document.getElementById('latency');
    const bandwidthInput = document.getElementById('bandwidth');

    socket.on('connect', () => {
        status.textContent = 'Connected to server';
        console.log('Connected to server');
    });

    socket.on('disconnect', () => {
        status.textContent = 'Disconnected from server';
        console.log('Disconnected from server');
    });

    // Function to update the progress bar based on the estimated time
    function updateProgressBar(progressBar, duration) {
        progressBar.value = 0;
        let elapsedTime = 0;
        const interval = setInterval(() => {
            elapsedTime += 100;
            progressBar.value = Math.min((elapsedTime / duration) * 100, 100);
            if (elapsedTime >= duration) {
                clearInterval(interval);
            }
        }, 100);
    }

    // Handle AI query
    sendBtn.addEventListener('click', () => {
        const message = messageInput.value.trim();
        const destination = destinationSelect.value;
        const latency = parseInt(latencyInput.value, 10);
        const bandwidth = parseInt(bandwidthInput.value, 10);

        if (message) {
            aiResponseDiv.textContent = 'Sending query to AI...';
            responseDiv.textContent = 'Waiting for response...';
            messageStatsDiv.innerHTML = ''; // Clear previous stats

            // Emit message to the server with settings
            socket.emit('sendAIQuery', { message, destination, latency, bandwidth }, (response) => {
                console.log('Response received from server:', response);
                if (response && response.success) {
                    const { timeEstimate, distance, speed, solsDifference } = response.data;

                    aiResponseDiv.textContent = `AI Response received!`;
                    responseDiv.textContent = `AI Response received!`;

                    // Start the progress bar
                    updateProgressBar(messageProgressBar, timeEstimate);

                    // Display stats
                    messageStatsDiv.innerHTML = `
                        <p><strong>Estimated Transmission Time:</strong> ${timeEstimate} ms</p>
                        <p><strong>Latency:</strong> ${latency} ms</p>
                        <p><strong>Bandwidth:</strong> ${bandwidth} kbps</p>
                        <p><strong>Approx. Distance Traveled:</strong> ${distance.toLocaleString()} km</p>
                        <p><strong>Approx. Speed:</strong> ${speed.toFixed(2)} km/s</p>
                        <p><strong>Sols Since Last Sync:</strong> ${solsDifference}</p>
                    `;
                    console.log('UI updated successfully');
                } else {
                    aiResponseDiv.textContent = `Error: ${response ? response.message : 'No response received'}`;
                    responseDiv.textContent = 'Failed to receive AI response';
                    console.error('Failed to process AI query:', response ? response.message : 'No response received');
                }
            });
        }
    });

    // Add event listener for updating settings
    document.getElementById('apply-settings').addEventListener('click', () => {
        const settings = {
            latency: parseInt(latencyInput.value, 10),
            bandwidth: parseInt(bandwidthInput.value, 10)
        };
        socket.emit('updateSettings', settings);
    });
});