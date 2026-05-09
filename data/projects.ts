export type Video = {
  id: string;
  src: string;
  title?: string;
  clipStart?: number;
  clipEnd?: number;
};

const PLACEHOLDER_REEL_MP4 =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

export const reelVideos: Video[] = [
  {
    id: "1",
    src: PLACEHOLDER_REEL_MP4,
    title: "Campaign Identity",
    clipStart: 0,
    clipEnd: 4,
  },
  {
    id: "2",
    src: PLACEHOLDER_REEL_MP4,
    title: "Brand System",
    clipStart: 4,
    clipEnd: 8,
  },
  {
    id: "3",
    src: PLACEHOLDER_REEL_MP4,
    title: "Visual Direction",
    clipStart: 8,
    clipEnd: 12,
  },
  {
    id: "4",
    src: PLACEHOLDER_REEL_MP4,
    title: "Motion Concept",
    clipStart: 12,
    clipEnd: 16,
  },
  {
    id: "5",
    src: PLACEHOLDER_REEL_MP4,
    title: "Design Exploration",
    clipStart: 16,
    clipEnd: 20,
  },
  {
    id: "6",
    src: PLACEHOLDER_REEL_MP4,
    title: "Creative Direction",
    clipStart: 20,
    clipEnd: 24,
  },
  {
    id: "7",
    src: PLACEHOLDER_REEL_MP4,
    title: "Test",
    clipStart: 24,
    clipEnd: 28,
  },
];
