// main.js

document.addEventListener('DOMContentLoaded', () => {
    const socket = io(); // Use the global io object from the CDN
    const status = document.getElementById('status');
    const sendBtn = document.getElementById('send');
    const messageInput = document.getElementById('message');
    const responseDiv = document.getElementById('response');
    const cachedResponseDiv = document.getElementById('cachedResponse');

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
