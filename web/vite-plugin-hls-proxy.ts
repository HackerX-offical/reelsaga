import type { Plugin } from "vite";
// @ts-expect-error — ESM .mjs module
import { createHlsProxyMiddleware } from "./server/hls-proxy.mjs";

export function hlsProxyPlugin(): Plugin {
  const attach = (server: { middlewares: { use: (fn: unknown) => void } }) => {
    server.middlewares.use(createHlsProxyMiddleware());
  };

  return {
    name: "hls-proxy",
    configureServer: attach,
    configurePreviewServer: attach,
  };
}
