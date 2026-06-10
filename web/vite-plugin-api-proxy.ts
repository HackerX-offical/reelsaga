import type { Connect, Plugin } from "vite";

const API = "https://api.reelsaga.in";
const SKIP = new Set(["host", "connection", "content-length"]);

function attachProxy(server: { middlewares: Connect.Server }) {
  server.middlewares.use(async (req, res, next) => {
    if (!req.url?.startsWith("/rs/") && !req.url?.startsWith("/api/")) return next();

    const url = new URL(req.url, "http://localhost");
    const target = `${API}${url.pathname.replace(/^\/(rs|api)/, "")}${url.search}`;

    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (SKIP.has(key.toLowerCase()) || value == null) continue;
      headers[key] = Array.isArray(value) ? value.join(", ") : value;
    }

    try {
      const chunks: Buffer[] = [];
      await new Promise<void>((resolve, reject) => {
        req.on("data", (c) => chunks.push(c));
        req.on("end", resolve);
        req.on("error", reject);
      });

      const upstream = await fetch(target, {
        method: req.method ?? "GET",
        headers,
        body: chunks.length ? Buffer.concat(chunks) : undefined,
      });

      res.statusCode = upstream.status;
      upstream.headers.forEach((v, k) => {
        if (k.toLowerCase() !== "transfer-encoding") res.setHeader(k, v);
      });
      res.end(Buffer.from(await upstream.arrayBuffer()));
    } catch (err) {
      console.error("[api-proxy]", err);
      res.statusCode = 502;
      res.end(JSON.stringify({ success: false, message: "API proxy error" }));
    }
  });
}

export function apiProxyPlugin(): Plugin {
  return {
    name: "api-proxy",
    configureServer: attachProxy,
    configurePreviewServer: attachProxy,
  };
}
