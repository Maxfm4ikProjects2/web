const API_BASE = 'https://www.maxfm4ik.site';

async function getVideoInfo(url) {
  const res = await fetch(`${API_BASE}/api/info?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error('Info fetch failed');
  return res.json();
}

async function downloadVideo(videoId, formatId) {
  const downloadUrl =
    `${API_BASE}/api/download?url=${encodeURIComponent(
      youtubeUrlInput.value.trim()
    )}&itag=${formatId}`;
  // trigger browser download
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.click();
  return true;
}