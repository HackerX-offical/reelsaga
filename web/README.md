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
2. **Recommended:** set **Root Directory** → `web`, then deploy
3. **Or:** leave Root Directory empty — root `vercel.json` builds `web/` automatically

API routing:

- `/rs/*` → edge rewrite to `api.reelsaga.in` (JSON catalog + auth)
- `/hls/*` → serverless ffmpeg transcode (`api/hls/`) — separate from `/rs` so video proxy is not blocked
- SPA fallback for React Router

If you see *"The page could not be found"* or *"not valid JSON"*, the API rewrite is missing — redeploy after pulling latest `vercel.json`.

## Features

- Live home feed, full paginated catalog (~230+ shows), trailers, clips
- Viewport-locked watch theater
- Continue watching (localStorage)
- HLS playback with auto-transcode on non-Safari browsers
