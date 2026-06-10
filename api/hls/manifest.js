function resolveUrl(base, relative) {
  if (relative.startsWith("http")) return relative;
  if (relative.startsWith("/")) return new URL(relative, base).href;
  const dir = base.slice(0, base.lastIndexOf("/") + 1);
  return dir + relative;
}

function proxyPath(type, absoluteUrl, origin) {
  return `${origin}/hls/${type}?url=${encodeURIComponent(absoluteUrl)}`;
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

function requestOrigin(req) {
  const proto = req.headers["x-forwarded-proto"] ?? "https";
  const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? "";
  return `${proto}://${host}`;
}

export default async function handler(req, res) {
  const url = req.query?.url;
  if (!url) {
    res.status(400).json({ error: "Missing url" });
    return;
  }
  try {
    const upstream = await fetch(url, {
      headers: { "User-Agent": "ReelSaga-Web/1.0" },
    });
    if (!upstream.ok) {
      res.status(502).json({ error: `Upstream ${upstream.status}` });
      return;
    }
    const text = await upstream.text();
    const body = rewritePlaylist(text, url, requestOrigin(req));
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).send(body);
  } catch (err) {
    console.error("[hls/manifest]", err);
    res.status(502).json({ error: "Manifest proxy failed", detail: String(err.message ?? err) });
  }
}
