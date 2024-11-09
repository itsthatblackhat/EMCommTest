// main.js

document.addEventListener('DOMContentLoaded', () => {
    const socket = io(); // Use the global io object from the CDN
    const status = document.getElementById('status');
    const sendBtn = document.getElementById('send');
    const messageInput = document.getElementById('message');
    const responseDiv = document.getElementById('response');
    const cachedResponseDiv = document.getElementById('cachedResponse');

    // Simulation controls
    const latencyInput = document.getElementById('latency');
    const bandwidthInput = document.getElementById('bandwidth');
    const scenarioSelect = document.getElementById('scenario');
    const applySettingsBtn = document.getElementById('apply-settings');

    socket.on('connect', () => {
        status.textContent = 'Connected to server';
    });

    socket.on('serverResponse', (data) => {
        responseDiv.textContent = `Server Response: ${JSON.stringify(data)}`;
    });

    sendBtn.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message) {
            socket.emit('requestData', { message: message }, (response) => {
                responseDiv.textContent = `Server Response: ${response.data}`;
            });
            socket.emit('aiQuery', message, (result) => {
                if (result.success) {
                    responseDiv.textContent = `AI Response: ${result.data.data}`;
                } else {
                    responseDiv.textContent = `AI Error: ${result.message}`;
                }
            });
            messageInput.value = '';
            responseDiv.textContent = 'Waiting for server response...';
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

    function getCachedData() {
        fetch('/data')
            .then(response => {
                const cacheStatus = response.headers.get('X-Cache') || 'Unknown';
                return response.json().then(data => ({ data, cacheStatus }));
            })
            .then(({ data, cacheStatus }) => {
                cachedResponseDiv.textContent = `Cached Response (Cache Status: ${cacheStatus}): ${JSON.stringify(data)}`;
            })
            .catch(error => {
                cachedResponseDiv.textContent = `Error fetching cached data: ${error.message}`;
            });
    }

    getCachedData();
    setInterval(getCachedData, 60000);
});
