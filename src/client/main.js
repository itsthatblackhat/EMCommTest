// main.js

document.addEventListener('DOMContentLoaded', () => {
    const socket = io(); // Use the global io object from the CDN
    const status = document.getElementById('status');
    const sendBtn = document.getElementById('send');
    const messageInput = document.getElementById('message');
    const responseDiv = document.getElementById('response');
    const imageStatusDiv = document.getElementById('imageStatus');
    const receivedImageContainer = document.getElementById('receivedImageContainer');

    // Simulation controls
    const latencyInput = document.getElementById('latency');
    const bandwidthInput = document.getElementById('bandwidth');
    const scenarioSelect = document.getElementById('scenario');
    const applySettingsBtn = document.getElementById('apply-settings');

    socket.on('connect', () => {
        status.textContent = 'Connected to server';
    });

    sendBtn.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message) {
            responseDiv.textContent = 'Waiting for server response...';

            socket.emit('sendTextMessage', { message: message }, (response) => {
                if (response.success) {
                    responseDiv.textContent = `Received Message: ${response.data}`;
                } else {
                    responseDiv.textContent = `Error: ${response.message}`;
                }
            });

            messageInput.value = '';
        }
    });

    // Handle simulation settings
    applySettingsBtn.addEventListener('click', () => {
        const latency = parseInt(latencyInput.value, 10);
        const bandwidth = parseInt(bandwidthInput.value, 10);
        const scenario = scenarioSelect.value;

        if (scenario !== 'custom') {
            applyScenarioPreset(scenario);
        } else {
            socket.emit('updateSettings', { latency, bandwidth });
        }
    });

    function applyScenarioPreset(scenario) {
        let settings = {};
        switch (scenario) {
            case 'current':
                settings = {
                    latency: 1260000, // Approximate one-way light time to Mars at 1.5 AU in ms (~21 minutes)
                    bandwidth: 4000   // 4 Mbps
                };
                break;
            case 'future':
                settings = {
                    latency: 1260000, // Latency remains the same due to speed of light
                    bandwidth: 1000000000 // 1 Pb/s (Petabit per second)
                };
                break;
            default:
                settings = {
                    latency: 60000,
                    bandwidth: 4000
                };
        }
        latencyInput.value = settings.latency;
        bandwidthInput.value = settings.bandwidth;
        socket.emit('updateSettings', settings);
    }

    // Function to send the image
    function sendImage() {
        imageStatusDiv.textContent = 'Sending image...';

        socket.emit('sendImage', {}, (response) => {
            if (response.success) {
                const imgUrl = `data:image/png;base64,${response.data}`;
                displayReceivedImage(imgUrl);
                imageStatusDiv.textContent = 'Image received successfully!';
            } else {
                imageStatusDiv.textContent = `Error: ${response.message}`;
            }
        });
    }

    // Function to display the received image
    function displayReceivedImage(imgUrl) {
        receivedImageContainer.innerHTML = ''; // Clear previous image
        const img = document.createElement('img');
        img.src = imgUrl;
        img.alt = 'Received Image';
        receivedImageContainer.appendChild(img);
    }

    document.getElementById('send-image').addEventListener('click', sendImage);
});
