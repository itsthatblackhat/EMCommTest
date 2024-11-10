document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    // Function to safely get elements by ID, returning an object with a no-op textContent method if not found
    const safeGetElementById = (id) => document.getElementById(id) || { textContent: (text) => console.error(`Element with id ${id} not found`) };

    // Get all required elements
    const status = safeGetElementById('status');
    const sendBtn = safeGetElementById('send');
    const messageInput = safeGetElementById('message');
    const responseDiv = safeGetElementById('response');
    const aiResponseDiv = safeGetElementById('aiResponse');
    const messageProgressBar = safeGetElementById('messageProgressBar');
    const messageStatsDiv = safeGetElementById('messageStats');
    const destinationSelect = safeGetElementById('destination');
    const latencyInput = safeGetElementById('latency');
    const bandwidthInput = safeGetElementById('bandwidth');
    const applySettingsBtn = safeGetElementById('apply-settings');

    // Check if all necessary elements exist
    if (!(sendBtn && messageInput && responseDiv && aiResponseDiv && messageProgressBar && messageStatsDiv && destinationSelect && latencyInput && bandwidthInput && applySettingsBtn)) {
        console.error('One or more required DOM elements not found.');
        return;
    }

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
        if (!progressBar) {
            console.error('Progress bar element not found');
            return;
        }
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
                if (response && response.success) {
                    const { timeEstimate, distance, speed, solsDifference } = response.data;

                    aiResponseDiv.textContent = 'AI Response received!';
                    responseDiv.textContent = 'AI Response received!';

                    // Start the progress bar
                    updateProgressBar(messageProgressBar, timeEstimate);

                    // Display stats
                    messageStatsDiv.innerHTML = `
                        <p><strong>Estimated Transmission Time:</strong> ${timeEstimate} ms</p>
                        <p><strong>Latency:</strong> ${latency} ms</p>
                        <p><strong>Bandwidth:</strong> ${bandwidth} kbps</p>
                        <p><strong>Approx. Distance Traveled:</strong> ${distance.toLocaleString()} km</p>
                        <p><strong>Approx. Speed:</strong> ${speed.toFixed(2)} km/s</p>
                        <p><strong>Sols Difference:</strong> ${solsDifference}</p>
                    `;
                } else {
                    aiResponseDiv.textContent = 'Error: No response or invalid response from server';
                    responseDiv.textContent = 'Error: AI query failed';
                }
            });
        } else {
            aiResponseDiv.textContent = 'Please enter a message to send to the AI.';
        }
    });

    // Apply settings functionality
    applySettingsBtn.addEventListener('click', () => {
        const newLatency = parseInt(latencyInput.value, 10);
        const newBandwidth = parseInt(bandwidthInput.value, 10);

        if (!isNaN(newLatency) && !isNaN(newBandwidth)) {
            socket.emit('applySettings', { latency: newLatency, bandwidth: newBandwidth }, (response) => {
                if (response && response.success) {
                    aiResponseDiv.textContent = 'Settings applied successfully!';
                } else {
                    aiResponseDiv.textContent = 'Failed to apply settings. Try again with valid numbers.';
                }
            });
        } else {
            aiResponseDiv.textContent = 'Please enter valid numbers for latency and bandwidth.';
        }
    });
});