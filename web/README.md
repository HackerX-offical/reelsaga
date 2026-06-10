# ReelSaga Web

Premium Netflix-style viewer — live from `api.reelsaga.in`.

## Local dev

```bash
cd web
npm install
npm run dev
```

Requires **ffmpeg** for Chrome/Firefox video (`brew install ffmpeg`).

## Deploy to Vercel

1. Import repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** → `web`
3. Framework preset: **Vite** (auto-detected from `vercel.json`)
4. Deploy

All serverless routes live in `web/api/` (no duplicate at repo root):

- `/api/*` → proxy to `api.reelsaga.in`
- `/hls/*` → ffmpeg HEVC → H.264 transcode
- SPA fallback for React Router

## Features

- Live home feed, full paginated catalog (~230+ shows), trailers, clips
- Viewport-locked watch theater
- Continue watching (localStorage)
- HLS playback with auto-transcode on non-Safari browsers
