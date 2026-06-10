import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const segmentCache = new Map();
const inflight = new Map();
const MAX_CACHE = 40;

function ffmpegPath() {
  try {
    return require("ffmpeg-static");
  } catch {
    return "ffmpeg";
  }
}

function transcodeSegment(url) {
  const key = createHash("sha1").update(url).digest("hex");
  if (segmentCache.has(key)) return Promise.resolve(segmentCache.get(key));
  if (inflight.has(key)) return inflight.get(key);

  const job = new Promise((resolve, reject) => {
    const chunks = [];
    const ff = spawn(
      ffmpegPath(),
      [
        "-loglevel", "error",
        "-i", url,
        "-c:v", "libx264", "-preset", "ultrafast", "-tune", "zerolatency",
        "-crf", "23", "-vf", "scale=-2:720",
        "-c:a", "aac", "-b:a", "128k",
        "-f", "mpegts", "pipe:1",
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    ff.stdout.on("data", (c) => chunks.push(c));
    ff.stderr.on("data", (d) => console.error("[hls/segment]", d.toString().trim()));
    ff.on("error", reject);
    ff.on("close", (code) => {
      inflight.delete(key);
      if (code !== 0) return reject(new Error(`ffmpeg exit ${code}`));
      const buf = Buffer.concat(chunks);
      if (segmentCache.size >= MAX_CACHE) {
        segmentCache.delete(segmentCache.keys().next().value);
      }
      segmentCache.set(key, buf);
      resolve(buf);
    });
  });
  inflight.set(key, job);
  return job;
}

export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  const url = req.query?.url;
  if (!url) {
    res.status(400).json({ error: "Missing url" });
    return;
  }
  try {
    const buf = await transcodeSegment(url);
    res.setHeader("Content-Type", "video/MP2T");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).send(buf);
  } catch (err) {
    console.error("[hls/segment]", err);
    res.status(502).json({ error: "Segment transcode failed", detail: String(err.message ?? err) });
  }
}
