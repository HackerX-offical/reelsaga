import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const segmentCache = new Map();
const inflight = new Map();
const MAX_CACHE = 50;

function ffmpegPath() {
  try {
    return require("ffmpeg-static");
  } catch {
    return "ffmpeg";
  }
}

function resolveUrl(base, relative) {
  if (relative.startsWith("http")) return relative;
  if (relative.startsWith("/")) return new URL(relative, base).href;
  const dir = base.slice(0, base.lastIndexOf("/") + 1);
  return dir + relative;
}

function proxyPath(type, absoluteUrl, origin) {
  const base = origin ?? "";
  return `${base}/hls/${type}?url=${encodeURIComponent(absoluteUrl)}`;
}

function rewritePlaylist(content, baseUrl, origin) {
  return content
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return line;
      const absolute = resolveUrl(baseUrl, trimmed);
      if (trimmed.includes(".m3u8")) return proxyPath("manifest", absolute, origin);
      if (trimmed.endsWith(".ts")) return proxyPath("segment", absolute, origin);
      return line;
    })
    .join("\n");
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "ReelSaga-Web/1.0" },
  });
  if (!res.ok) throw new Error(`Upstream ${res.status}`);
  return res.text();
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
    ff.stderr.on("data", (d) => console.error("[hls]", d.toString().trim()));
    ff.on("error", (err) => reject(err));
    ff.on("close", (code) => {
      inflight.delete(key);
      if (code !== 0) return reject(new Error(`Transcode failed (code ${code})`));
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

export function requestOrigin(req) {
  const proto = req.headers["x-forwarded-proto"] ?? "https";
  const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? "";
  return `${proto}://${host}`;
}

export async function handleManifest(url, origin) {
  const text = await fetchText(url);
  return rewritePlaylist(text, url, origin);
}

export async function handleSegment(url) {
  return transcodeSegment(url);
}

export function createHlsProxyMiddleware() {
  return async (req, res, next) => {
    const { pathname, searchParams } = new URL(req.url, "http://localhost");
    if (!pathname.startsWith("/hls/")) return next();
    const target = searchParams.get("url");
    if (!target) {
      res.statusCode = 400;
      res.end("Missing url");
      return;
    }
    const origin = "http://localhost:5173";
    try {
      if (pathname === "/hls/manifest") {
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.setHeader("Cache-Control", "no-cache");
        res.end(await handleManifest(target, origin));
        return;
      }
      if (pathname === "/hls/segment") {
        const buf = await handleSegment(target);
        res.setHeader("Content-Type", "video/MP2T");
        res.setHeader("Cache-Control", "public, max-age=86400");
        res.end(buf);
        return;
      }
      res.statusCode = 404;
      res.end("Not found");
    } catch (err) {
      console.error("[hls-proxy]", err.message);
      res.statusCode = 502;
      res.end("Stream proxy error");
    }
  };
}
