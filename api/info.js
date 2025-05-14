import Cors from 'cors';
import ytdl from 'ytdl-core';

const cors = Cors({ methods: ['GET'], origin: 'https://www.maxfm4ik.site' });
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, err => err ? reject(err) : resolve());
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  const rawUrl = req.query.url;
  if (!rawUrl) {
    return res.status(400).json({ error: 'Missing URL' });
  }

  let videoId;
  try {
    videoId = ytdl.getURLVideoID(rawUrl);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  // Reconstruct a clean canonical URL
  const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const info = await ytdl.getInfo(cleanUrl);
    const formats = ytdl
      .filterFormats(info.formats, 'audioandvideo')
      .map(f => ({ itag: f.itag, qualityLabel: f.qualityLabel, container: f.container, contentLength: f.contentLength }));

    return res.status(200).json({
      videoId: info.videoDetails.videoId,
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails.slice(-1)[0].url,
      formats
    });
  } catch (err) {
    console.error('ytdl getInfo error:', err);
    if (err.message.includes('Status code: 410')) {
      return res.status(404).json({ error: 'Video unavailable (removed or restricted)' });
    }
    return res.status(500).json({ error: 'Info fetch failed', details: err.message });
  }
}