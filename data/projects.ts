import { reelVideos as generatedReelVideos } from "./reel-videos.generated";

export type Video = {
  id: string;
  src: string;
  /** Full-quality original, used as the desktop default. Falls back to `src`. */
  srcHigh?: string;
  /** With-audio version for the click-to-play modal. Falls back to `srcHigh`/`src`. */
  srcFull?: string;
  poster?: string;
  title?: string;
  clipStart?: number;
  clipEnd?: number;
};

// Public R2 base URL for the full modal videos (no trailing slash), e.g.
// "https://pub-xxxx.r2.dev" or your custom domain.
const R2_BASE = "https://pub-440360b0255e420c87b6d7bd42dcd096.r2.dev";

// Per-reel filename in the R2 bucket, keyed by reel title. Fill in as you upload;
// leave blank to fall back to the local clip. The modal plays R2 when set.
const R2_FILES: Record<string, string> = {
  CONCEPTS: "CONCEPTS_MP4.mp4",
  "NIGHTCLUB DOM": "DOM_MP4.mp4",
  KLANGI: "KLANGI_MP4.mp4",
  "ARC LAB": "ARCLAB_MP4.mp4",
  "HILDÉN & KAIRA": "hk.mov",
  "WAVE VENTURES": "WAVE_MP4.mov",
};

export const reelVideos: Video[] = generatedReelVideos.map((v) => {
  const file = v.title ? R2_FILES[v.title]?.trim() : "";
  return file ? { ...v, srcFull: `${R2_BASE}/${file}` } : { ...v };
});
