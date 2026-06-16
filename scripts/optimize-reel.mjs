// Local, on-demand reel optimizer. NOT run during the Vercel build.
//
//   npm run optimize:reel
//
// Re-encodes the source clips in public/media/*.mp4 into web-optimized versions
// (smaller, faststart, audio stripped) plus a poster frame, written to
// public/media/optimized/. Commit that folder — the build/Vercel just serves it.
//
// Uses the ffmpeg binary from `ffmpeg-static`, so no system ffmpeg is required.

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";

const PROJECT_ROOT = process.cwd();
const MEDIA_DIR = path.join(PROJECT_ROOT, "public", "media");
const OUT_DIR = path.join(MEDIA_DIR, "optimized");

// Cap the long edge of the portrait clips. 1080 keeps them crisp on most
// displays while cutting decode cost vs. full 4K source. Lower this (e.g. 900)
// for even lighter mobile playback.
const MAX_HEIGHT = 1080;
const CRF = 21; // ~19-23: visually near-lossless colour, still a fraction of the source bitrate.
const POSTER_HEIGHT = 720;

function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args, { stdio: ["ignore", "ignore", "inherit"] });
    child.on("error", reject);
    child.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
  });
}

async function fileSize(p) {
  try {
    return (await fs.stat(p)).size;
  } catch {
    return 0;
  }
}

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)}MB`;

async function main() {
  if (!ffmpegPath) {
    throw new Error("ffmpeg-static did not provide a binary path. Run `npm install` first.");
  }

  await fs.mkdir(OUT_DIR, { recursive: true });

  const entries = await fs.readdir(MEDIA_DIR, { withFileTypes: true });
  const sources = entries
    .filter((e) => e.isFile() && /\.(mp4|webm|mov)$/i.test(e.name))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b, "en"));

  if (sources.length === 0) {
    console.log("[optimize-reel] No source clips found in public/media.");
    return;
  }

  let beforeTotal = 0;
  let afterTotal = 0;

  for (const name of sources) {
    const base = name.replace(/\.[^.]+$/, "");
    const src = path.join(MEDIA_DIR, name);
    const outMp4 = path.join(OUT_DIR, `${base}.mp4`);
    const outPoster = path.join(OUT_DIR, `${base}.jpg`);

    const srcStat = await fs.stat(src);
    const outStat = await fs.stat(outMp4).catch(() => null);
    const upToDate = outStat && outStat.mtimeMs >= srcStat.mtimeMs;

    beforeTotal += srcStat.size;

    if (upToDate) {
      afterTotal += outStat.size;
      console.log(`[optimize-reel] ${name}: up to date, skipping.`);
      continue;
    }

    console.log(`[optimize-reel] Encoding ${name} ...`);
    await run([
      "-y",
      "-i", src,
      "-an", // muted in the UI — drop the audio track
      "-vf", `scale=-2:'min(${MAX_HEIGHT},ih)':flags=lanczos`,
      "-c:v", "libx264",
      "-profile:v", "high",
      "-pix_fmt", "yuv420p",
      "-preset", "veryfast",
      "-crf", String(CRF),
      "-movflags", "+faststart", // moov atom up front for progressive playback
      outMp4,
    ]);

    await run([
      "-y",
      "-i", src,
      "-vf", `scale=-2:'min(${POSTER_HEIGHT},ih)'`,
      "-frames:v", "1",
      "-update", "1",
      "-q:v", "4",
      outPoster,
    ]);

    afterTotal += await fileSize(outMp4);
    console.log(`[optimize-reel]   -> ${mb(srcStat.size)} -> ${mb(await fileSize(outMp4))} (+ poster)`);
  }

  console.log(`\n[optimize-reel] Done. Total ${mb(beforeTotal)} -> ${mb(afterTotal)}.`);
  console.log("[optimize-reel] Now run `npm run gen:reel` (or just `npm run dev`) and commit public/media/optimized/.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
