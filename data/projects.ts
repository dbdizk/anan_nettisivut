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

export const reelVideos: Video[] = [...generatedReelVideos];
