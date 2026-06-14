import { reelVideos as generatedReelVideos } from "./reel-videos.generated";

export type Video = {
  id: string;
  src: string;
  poster?: string;
  title?: string;
  clipStart?: number;
  clipEnd?: number;
};

export const reelVideos: Video[] = [...generatedReelVideos];
