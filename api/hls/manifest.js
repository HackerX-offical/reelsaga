export const config = {
  runtime: "edge",
};

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

export default async function handler(req) {
  const url = new URL(req.url);
  const target = url.searchParams.get("url");
  if (!target) {
    return new Response(JSON.stringify({ error: "Missing url" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const origin = url.origin;

  try {
    const upstream = await fetch(target, {
      headers: { "User-Agent": "ReelSaga-Web/1.0" },
    });
    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: `Upstream ${upstream.status}` }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }
    const text = await upstream.text();
    const body = rewritePlaylist(text, target, origin);
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Manifest proxy failed", detail: String(err) }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }
}
