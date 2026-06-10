import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { getPlayableStreamUrl, needsTranscodeProxy } from "../lib/stream";
import "./VideoPlayer.css";

interface Props {
  src: string;
  poster?: string;
  title?: string;
  episodeLabel?: string;
  layout?: "default" | "theater";
  onEnded?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

function canPlayNativeHls(): boolean {
  const v = document.createElement("video");
  return v.canPlayType("application/vnd.apple.mpegurl") !== "" && !needsTranscodeProxy();
}

export function VideoPlayer({
  src,
  poster,
  title,
  episodeLabel,
  layout = "default",
  onEnded,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<"loading" | "playing" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPoster, setShowPoster] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    const playUrl = getPlayableStreamUrl(src);

    setStatus("loading");
    setErrorMsg("");
    setShowPoster(true);

    const markPlaying = () => {
      if (video.videoWidth > 0) {
        setShowPoster(false);
        setStatus("playing");
      }
    };

    const onLoadedData = () => markPlaying();
    const onPlaying = () => markPlaying();
    const onWaiting = () => setStatus("loading");
    const onError = () => {
      setStatus("error");
      setErrorMsg("Playback failed. Ensure ffmpeg is installed and restart the dev server.");
    };

    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("error", onError);

    if (canPlayNativeHls()) {
      video.src = playUrl;
      video.play().catch(() => {});
    } else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        startLevel: needsTranscodeProxy() ? 0 : -1,
        capLevelToPlayerSize: true,
        maxBufferLength: 45,
        maxMaxBufferLength: 90,
        manifestLoadingMaxRetry: 4,
        levelLoadingMaxRetry: 4,
        fragLoadingMaxRetry: 6,
      });
      hls.loadSource(playUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setStatus("error");
          setErrorMsg(
            data.type === Hls.ErrorTypes.NETWORK_ERROR
              ? "Network error loading stream. HLS proxy may be unavailable — try Safari or redeploy."
              : "Could not decode video. Ensure ffmpeg is available on the server.",
          );
          console.error("HLS error", data);
        }
      });
    } else {
      video.src = playUrl;
      video.play().catch(() => {});
    }

    const poll = window.setInterval(() => {
      if (video.videoWidth > 0 && !video.paused) markPlaying();
    }, 400);

    return () => {
      clearInterval(poll);
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("error", onError);
      hls?.destroy();
    };
  }, [src]);

  return (
    <div className={`player ${layout === "theater" ? "player--theater" : ""}`}>
      <div className="player__frame">
        {status === "loading" && (
          <div className="player__loader" aria-hidden>
            <div className="player__spinner" />
            {needsTranscodeProxy() && (
              <p className="player__hint">Preparing video…</p>
            )}
          </div>
        )}
        {status === "error" && (
          <div className="player__error">
            <p>{errorMsg}</p>
          </div>
        )}
        {showPoster && poster && status === "loading" && (
          <img src={poster} alt="" className="player__poster" />
        )}

        {hasPrev && onPrev && (
          <button
            type="button"
            className="player__nav player__nav--prev"
            onClick={onPrev}
            aria-label="Previous episode"
          >
            ‹
          </button>
        )}
        {hasNext && onNext && (
          <button
            type="button"
            className="player__nav player__nav--next"
            onClick={onNext}
            aria-label="Next episode"
          >
            ›
          </button>
        )}

        <video
          ref={videoRef}
          className="player__video"
          controls
          autoPlay
          playsInline
          onEnded={onEnded}
        />
      </div>

      {layout !== "theater" && (title || episodeLabel) && (
        <div className="player__meta">
          {episodeLabel && <span className="player__ep-label">{episodeLabel}</span>}
          {title && <p className="player__title">{title}</p>}
        </div>
      )}
    </div>
  );
}
