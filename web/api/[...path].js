const API = "https://api.reelsaga.in";

const SKIP_REQ = new Set(["host", "connection", "content-length"]);
const SKIP_RES = new Set(["transfer-encoding", "connection", "content-encoding"]);

async function readBody(req) {
  if (req.method === "GET" || req.method === "HEAD") return undefined;
  if (typeof req.body === "string") return req.body;
  if (Buffer.isBuffer(req.body)) return req.body;
  if (req.body && typeof req.body === "object") return JSON.stringify(req.body);

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return chunks.length ? Buffer.concat(chunks) : undefined;
}

export default async function handler(req, res) {
  const segments = req.query.path;
  const path = Array.isArray(segments) ? segments.join("/") : segments ?? "";
  const qs = req.url?.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  const target = `${API}/${path}${qs}`;

  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (SKIP_REQ.has(key.toLowerCase()) || value == null) continue;
    headers[key] = Array.isArray(value) ? value.join(", ") : value;
  }

  try {
    const body = await readBody(req);
    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body,
    });

    res.status(upstream.status);
    upstream.headers.forEach((v, k) => {
      if (!SKIP_RES.has(k.toLowerCase())) res.setHeader(k, v);
    });

    const buf = Buffer.from(await upstream.arrayBuffer());
    res.send(buf);
  } catch (err) {
    console.error("[api-proxy]", path, err.message);
    res.status(502).json({ success: false, message: "API proxy error" });
  }
}
