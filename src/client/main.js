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
            messageStatsDiv.textContent = '';

            // Emit message to the server with settings
            socket.emit('sendAIQuery', { message, destination, latency, bandwidth }, (response) => {
                console.log('Response received from server:', response);
                if (response && response.success) {
                    const aiData = response.data;

                    // Extract the estimated time from the AI response
                    const timeEstimateMatch = aiData.match(/TimeEstimate:([\d]+)/);
                    let estimatedTime = 0;

                    if (timeEstimateMatch) {
                        estimatedTime = parseInt(timeEstimateMatch[1], 10);
                        aiResponseDiv.textContent = `AI Response: ${aiData}`;
                        responseDiv.textContent = 'AI Response received!';

                        // Start the progress bar
                        updateProgressBar(messageProgressBar, estimatedTime);

                        // Display stats
                        messageStatsDiv.innerHTML = `
                            <p><strong>Estimated Transmission Time:</strong> ${estimatedTime} ms</p>
                            <p><strong>Latency:</strong> ${latency} ms</p>
                            <p><strong>Bandwidth:</strong> ${bandwidth} kbps</p>
                        `;
                        console.log('UI updated successfully');
                    } else {
                        aiResponseDiv.textContent = 'Error: Could not extract time estimate from AI response';
                        responseDiv.textContent = 'Failed to process AI response';
                        console.error('Failed to extract time estimate from AI response:', aiData);
                    }
                } else {
                    aiResponseDiv.textContent = `Error: ${response ? response.message : 'No response received'}`;
                    responseDiv.textContent = 'Failed to receive AI response';
                    console.error('Failed to process AI query:', response ? response.message : 'No response received');
                }
            });
        }
    });
});