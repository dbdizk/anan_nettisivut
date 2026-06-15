"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Video } from "@/data/projects";

export function ReelModal({ video, onClose }: { video: Video; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);

  // Prefer the with-audio version; fall back to the (silent) original / optimized.
  const source = video.srcFull ?? video.srcHigh ?? video.src;
  const title = video.title ?? "Video";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // lock background scroll while open
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  // Try to start playback with sound. Opening from a tap gives us user activation,
  // so this usually succeeds; if the browser still blocks it, the controls remain.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.play().catch(() => {});
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="flex max-h-[92vh] max-w-[94vw] flex-col overflow-hidden rounded-xl border border-gray-700/60 bg-[#0a0a0a] shadow-2xl shadow-black/70"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="relative flex h-9 shrink-0 items-center justify-center border-b border-black/60 bg-gradient-to-b from-[#272727] to-[#161616] px-12">
          <span className="truncate text-sm font-semibold tracking-wide text-gray-200">{title}</span>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-red-500 ring-1 ring-black/30 transition-colors hover:bg-red-400"
          />
        </div>

        {/* Video */}
        <video
          ref={videoRef}
          src={source}
          className="max-h-[calc(92vh-2.25rem)] w-auto max-w-[94vw] bg-black object-contain"
          controls
          autoPlay
          playsInline
          loop
        />
      </div>
    </div>,
    document.body
  );
}
