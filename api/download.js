import Cors from 'cors';
import ytdl from 'ytdl-core';

// Reuse middleware helper
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

const cors = Cors({
  methods: ['GET', 'HEAD'],
  origin: 'https://www.maxfm4ik.site',
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  await runMiddleware(req, res, cors);

  const videoUrl = req.query.url;
  const itag = req.query.itag;
  if (!videoUrl || !itag) {
    return res.status(400).send('Missing url or itag');
  }

  try {
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="video-${itag}.mp4"`
    );
    ytdl(videoUrl, { quality: itag }).pipe(res);
  } catch (error) {
    console.error('Error in /api/download:', error);
    res.status(500).send('Download failed');
  }
}
