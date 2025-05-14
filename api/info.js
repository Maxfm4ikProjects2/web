import Cors from 'cors';
import ytdl from 'ytdl-core';

// Helper to wait for middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

// Initialize CORS to only allow your frontend domain
const cors = Cors({
  methods: ['GET', 'HEAD'],
  origin: 'https://www.maxfm4ik.site',
});

export default async function handler(req, res) {
  // Only GET allowed
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  // Run CORS
  await runMiddleware(req, res, cors);

  const videoUrl = req.query.url;
  if (!videoUrl || !ytdl.validateURL(videoUrl)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    const info = await ytdl.getInfo(videoUrl);
    const formats = ytdl.filterFormats(info.formats, 'audioandvideo').map(f => ({
      itag: f.itag,
      qualityLabel: f.qualityLabel,
      container: f.container,
      contentLength: f.contentLength,
    }));

    return res.status(200).json({
      videoId: info.videoDetails.videoId,
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails.slice(-1)[0].url,
      formats,
    });
  } catch (error) {
    console.error('Error in /api/info:', error);
    return res.status(500).json({ error: 'Info fetch failed', details: error.message });
  }
}

