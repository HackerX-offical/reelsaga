import { handleSegment } from "../../server/hls-handlers.mjs";

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
    const buf = await handleSegment(url);
    res.setHeader("Content-Type", "video/MP2T");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.status(200).send(buf);
  } catch (err) {
    console.error("[hls/segment]", err);
    res.status(502).json({ error: "Segment transcode failed" });
  }
}
