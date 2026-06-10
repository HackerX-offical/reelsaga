/** Safari plays HEVC HLS natively; Chrome/Firefox need the ffmpeg proxy. */
export function needsTranscodeProxy(): boolean {
  const ua = navigator.userAgent;
  const isSafari = /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(ua);
  return !isSafari;
}

export function getPlayableStreamUrl(originalUrl: string): string {
  if (!needsTranscodeProxy()) return originalUrl;
  return `/hls/manifest?url=${encodeURIComponent(originalUrl)}`;
}
