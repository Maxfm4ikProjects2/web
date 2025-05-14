import { NowRequest, NowResponse } from '@vercel/node';
import ytdl from 'ytdl-core';
import Cors from 'cors';

// Initialize CORS middleware (only allow your frontend domain)
const cors = Cors({
  methods: ['GET', 'HEAD'],
  origin: 'https://www.maxfm4ik.site',
});

function runCors(req, res) {
  return new Promise((resolve, reject) => {
    cors(req, res, err => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export default async function handler(req, res) {
  await runCors(req, res);

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

    res.status(200).json({
      videoId: info.videoDetails.videoId,
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails.pop().url,
      formats,
    });
  } catch (err) {
    res.status(500).json({ error: 'Info fetch failed', details: err.message });
  }
}
