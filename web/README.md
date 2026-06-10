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

Import the **repository root** on [vercel.com](https://vercel.com). No manual Root Directory needed.

Root `vercel.json` automatically:

- Installs and builds this `web/` package
- Serves `web/dist` as static output
- Runs `/api/*` serverless proxy to `api.reelsaga.in`
- Runs `/hls/*` ffmpeg transcode (HEVC → H.264 for Chrome)
- SPA routing for React Router

**Alternative:** set Root Directory to `web` and use `web/vercel.json` instead.

## Content

The app paginates the live API (`page` + `limit`) to load the full catalog (~230+ shows), home feed sections, trailers, and clips.

## Features

- Live home feed sections, trailers, clips, full catalog
- Continue watching (localStorage)
- Genre browse filters
- HLS playback with auto-transcode on non-Safari browsers
- Viewport-locked watch theater (no scroll to change episodes)
