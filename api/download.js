import { NowRequest, NowResponse } from '@vercel/node';
import ytdl from 'ytdl-core';
import Cors from 'cors';

const corsDownload = Cors({
  methods: ['GET', 'HEAD'],
  origin: 'https://www.maxfm4ik.site',
});

function runCorsDownload(req, res) {
  return new Promise((resolve, reject) => {
    corsDownload(req, res, err => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export default async function handler(req, res) {
  await runCorsDownload(req, res);

  const videoUrl = req.query.url;
  const itag = req.query.itag;
  if (!videoUrl || !itag) {
    return res.status(400).send('Missing url or itag');
  }

  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${req.query.videoId || 'video'}.${itag}.mp4"`
  );

  ytdl(videoUrl, { quality: itag }).pipe(res);
}