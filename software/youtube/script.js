document.getElementById('downloadForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const videoUrl = document.getElementById('videoUrl').value;
    const format = document.getElementById('format').value;

    if (!videoUrl) {
        alert('Please enter a YouTube video URL.');
        return;
    }

    const statusText = document.getElementById('status');
    statusText.textContent = 'Fetching download link...';

    try {
        const apiBase = 'https://www.maxfm4ik.site/api';
        const response = await fetch(`${apiBase}/getFormats?videoUrl=${encodeURIComponent(videoUrl)}`);

        if (!response.ok) {
            throw new Error('Failed to fetch video formats.');
        }

        const data = await response.json();
        const selectedFormat = data.formats.find(f => f.itag === format || f.mimeType.includes(format));

        if (!selectedFormat) {
            throw new Error('Selected format not available.');
        }

        statusText.textContent = 'Starting download...';

        // Trigger download by navigating to the stream endpoint
        const streamUrl = `${apiBase}/stream?videoUrl=${encodeURIComponent(videoUrl)}&itag=${selectedFormat.itag}`;
        window.location.href = streamUrl;

    } catch (error) {
        console.error(error);
        statusText.textContent = 'Error: ' + error.message;
    }
});