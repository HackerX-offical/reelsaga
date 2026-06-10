import { handleManifest, requestOrigin } from "./handlers.mjs";

export default async function handler(req, res) {
  const url = req.query?.url;
  if (!url) {
    res.status(400).json({ error: "Missing url" });
    return;
  }
  try {
    const body = await handleManifest(url, requestOrigin(req));
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).send(body);
  } catch (err) {
    console.error("[hls/manifest]", err);
    res.status(502).json({ error: "Manifest proxy failed", detail: err.message });
  }
}
