function updateTime() {
    const now = new Date();

    // Earth time in 24-hour format
    const earthHours = now.getHours();
    const earthMinutes = now.getMinutes();
    const earthSeconds = now.getSeconds();
    const earthTimeString = `${earthHours.toString().padStart(2, '0')}:${earthMinutes.toString().padStart(2, '0')}:${earthSeconds.toString().padStart(2, '0')}`;
    document.getElementById('earth-time').textContent = `Earth Time: ${earthTimeString}`;

    // Mars time calculation
    const marsSolHours = 24.6597; // Mars sol in hours
    const earthSecondsTotal = earthHours * 3600 + earthMinutes * 60 + earthSeconds;
    const marsTimeRatio = marsSolHours / 24; // Ratio to convert Earth time to Mars time
    let marsSecondsTotal = Math.floor(earthSecondsTotal * marsTimeRatio);

    let marsHours = Math.floor(marsSecondsTotal / 3600);
    marsSecondsTotal %= 3600;
    let marsMinutes = Math.floor(marsSecondsTotal / 60);
    let marsSeconds = marsSecondsTotal % 60;

    // Normalize Mars time to 24-hour format
    if (marsHours >= 24) {
        marsHours -= 24;
    }

    // Format Mars time in 24-hour format
    const marsTimeString = `${marsHours.toString().padStart(2, '0')}:${marsMinutes.toString().padStart(2, '0')}:${marsSeconds.toString().padStart(2, '0')}`;
    document.getElementById('mars-time').textContent = `Mars Time: ${marsTimeString}`;
}

// Update time every second
setInterval(updateTime, 1000);