// Optimize the full WITH-AUDIO modal videos before uploading them to R2.
//   node scripts/optimize-full.mjs
// Reads public/media/full/*.{mp4,mov} and writes lighter versions (H.264 1080p,
// CRF 23, AAC, faststart) to public/media/full/optimized/. Upload THOSE to R2.

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";

const SRC_DIR = path.join(process.cwd(), "public", "media", "full");
const OUT_DIR = path.join(SRC_DIR, "optimized");
const MAX_HEIGHT = 1080;
const CRF = 23;

const run = (args) =>
  new Promise((res, rej) => {
    const c = spawn(ffmpegPath, args, { stdio: ["ignore", "ignore", "inherit"] });
    c.on("error", rej);
    c.on("close", (code) => (code === 0 ? res() : rej(new Error(`ffmpeg ${code}`))));
  });

const mb = (b) => `${(b / 1024 / 1024).toFixed(1)}MB`;

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const names = (await fs.readdir(SRC_DIR, { withFileTypes: true }))
    .filter((e) => e.isFile() && /\.(mp4|mov|webm)$/i.test(e.name))
    .map((e) => e.name);

  for (const name of names) {
    const base = name.replace(/\.[^.]+$/, "");
    const src = path.join(SRC_DIR, name);
    const out = path.join(OUT_DIR, `${base}.mp4`);
    console.log(`[optimize-full] Encoding ${name} ...`);
    await run([
      "-y",
      "-i", src,
      "-vf", `scale=-2:'min(${MAX_HEIGHT},ih)':flags=lanczos`,
      "-c:v", "libx264",
      "-profile:v", "high",
      "-pix_fmt", "yuv420p",
      "-preset", "veryfast",
      "-crf", String(CRF),
      "-c:a", "aac",
      "-b:a", "160k",
      "-movflags", "+faststart",
      out,
    ]);
    const [si, oi] = [await fs.stat(src), await fs.stat(out)];
    console.log(`[optimize-full]   ${mb(si.size)} -> ${mb(oi.size)}`);
  }
  console.log(`[optimize-full] Done -> ${path.relative(process.cwd(), OUT_DIR)}. Upload these to R2.`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
