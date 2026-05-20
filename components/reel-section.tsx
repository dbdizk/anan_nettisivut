"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { reelVideos, type Video } from "@/data/projects";

function ReelVideoCard({
  video,
  rootRef,
  onHoverChange,
}: {
  video: Video;
  rootRef: RefObject<HTMLDivElement | null>;
  onHoverChange: (isHovering: boolean) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const cardEl = cardRef.current;
    const videoEl = videoRef.current;
    const rootEl = rootRef.current;
    if (!cardEl || !videoEl) return;

    const hasClip = typeof video.clipStart === "number" && typeof video.clipEnd === "number";
    const clipStart = video.clipStart ?? 0;
    const clipEnd = video.clipEnd ?? Number.POSITIVE_INFINITY;

    const clampToClipStart = () => {
      if (!hasClip) return;
      if (!Number.isFinite(videoEl.duration)) return;
      const safeStart = Math.min(Math.max(0, clipStart), Math.max(0, videoEl.duration - 0.01));
      if (Math.abs(videoEl.currentTime - safeStart) > 0.25) {
        try {
          videoEl.currentTime = safeStart;
        } catch {
          // Ignore seeks that fail before metadata is ready.
        }
      }
    };

    const onLoadedMetadata = () => {
      clampToClipStart();
    };

    const onTimeUpdate = () => {
      if (!hasClip) return;
      if (videoEl.currentTime >= clipEnd) {
        try {
          videoEl.currentTime = clipStart;
        } catch {
          // Ignore.
        }
      }
    };

    videoEl.addEventListener("loadedmetadata", onLoadedMetadata);
    videoEl.addEventListener("timeupdate", onTimeUpdate);

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target !== cardEl) continue;
          if (entry.isIntersecting) {
            clampToClipStart();
            videoEl.play().catch(() => {
              // Autoplay can be blocked; keep it muted/inline and ignore.
            });
          } else {
            videoEl.pause();
          }
        }
      },
      {
        root: rootEl ?? null,
        threshold: 0.6,
      }
    );

    io.observe(cardEl);
    return () => {
      io.disconnect();
      videoEl.removeEventListener("loadedmetadata", onLoadedMetadata);
      videoEl.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [rootRef, video.clipEnd, video.clipStart]);

  return (
    <figure
      ref={cardRef}
      data-reel-card="true"
      className="group flex-shrink-0 h-[clamp(20.5rem,66vh,46rem)] md:h-[clamp(22rem,72vh,46rem)] aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden relative cursor-grab active:cursor-grabbing"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") onHoverChange(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") onHoverChange(false);
      }}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover transition-[filter] duration-300 ease-out group-hover:blur-sm group-hover:brightness-75"
        muted
        playsInline
        loop
        preload="metadata"
      >
        <source src={video.src} type="video/mp4" />
      </video>
      {video.title ? (
        <figcaption className="pointer-events-none absolute inset-0">
          <div className="absolute left-4 bottom-4 transition-opacity duration-300 ease-out opacity-100 group-hover:opacity-0">
            <span className="text-2xl md:text-3xl text-gray-200 drop-shadow-md">{video.title}</span>
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center transition-[opacity,transform] duration-300 ease-out opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100">
            <span className="text-3xl md:text-4xl font-semibold text-white drop-shadow-md">{video.title}</span>
          </div>
        </figcaption>
      ) : null}
    </figure>
  );
}

export function ReelSection() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);
  const loopWidthRef = useRef<number>(0);
  const offsetXRef = useRef<number>(0);

  const mobileRafRef = useRef<number | null>(null);
  const mobileLastTsRef = useRef<number>(0);
  const mobileLoopWidthRef = useRef<number>(0);
  const mobileIsInteractingRef = useRef(false);
  const mobileResumeTimerRef = useRef<number | null>(null);

  const [isDesktop, setIsDesktop] = useState(false);

  const isPausedByHoverRef = useRef(false);

  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartOffsetRef = useRef<number>(0);

  const loopedVideos = useMemo(() => [...reelVideos, ...reelVideos], []);

  useEffect(() => {
    const mq = globalThis.matchMedia?.("(min-width: 1024px)");
    if (!mq) return;

    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    if (isDesktop) return;

    const reduceMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reduceMotion) return;

    const clearResumeTimer = () => {
      if (mobileResumeTimerRef.current) {
        globalThis.clearTimeout(mobileResumeTimerRef.current);
        mobileResumeTimerRef.current = null;
      }
    };

    const markInteracting = () => {
      mobileIsInteractingRef.current = true;
      clearResumeTimer();
    };

    const scheduleResume = () => {
      clearResumeTimer();
      mobileResumeTimerRef.current = globalThis.setTimeout(() => {
        mobileIsInteractingRef.current = false;
      }, 1500) as unknown as number;
    };

    const updateLoopWidth = () => {
      // Track contains 2 identical sets.
      mobileLoopWidthRef.current = Math.floor(track.scrollWidth / 2);
    };

    // Measure a few times to catch late layout/media sizing.
    updateLoopWidth();
    const measureRaf1 = requestAnimationFrame(updateLoopWidth);
    const measureRaf2 = requestAnimationFrame(() => requestAnimationFrame(updateLoopWidth));

    const ro = new ResizeObserver(updateLoopWidth);
    ro.observe(track);

    viewport.addEventListener("pointerdown", markInteracting);
    viewport.addEventListener("pointerup", scheduleResume);
    viewport.addEventListener("pointercancel", scheduleResume);
    viewport.addEventListener("pointerleave", scheduleResume);
    viewport.addEventListener("touchstart", markInteracting, { passive: true });
    viewport.addEventListener("touchend", scheduleResume, { passive: true });
    viewport.addEventListener("touchcancel", scheduleResume, { passive: true });
    viewport.addEventListener("scroll", scheduleResume, { passive: true });

    const speedPxPerSecond = 14;

    const tick = (ts: number) => {
      const loop = mobileLoopWidthRef.current;
      const maxScroll = viewport.scrollWidth - viewport.clientWidth;

      if (maxScroll <= 1) {
        if (loop <= 0) updateLoopWidth();
        mobileRafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (loop <= 0) {
        mobileRafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (mobileIsInteractingRef.current) {
        mobileLastTsRef.current = ts;
        mobileRafRef.current = requestAnimationFrame(tick);
        return;
      }

      const last = mobileLastTsRef.current || ts;
      mobileLastTsRef.current = ts;
      const dt = Math.min(50, ts - last);

      const delta = (speedPxPerSecond * dt) / 1000;
      const next = viewport.scrollLeft + delta;

      // Prefer looping at `loop` when we have a duplicated track.
      if (loop > 0 && next >= loop) {
        viewport.scrollLeft = next - loop;
      } else if (next >= maxScroll) {
        viewport.scrollLeft = 0;
      } else {
        viewport.scrollLeft = next;
      }

      mobileRafRef.current = requestAnimationFrame(tick);
    };

    mobileRafRef.current = requestAnimationFrame(tick);

    return () => {
      clearResumeTimer();
      viewport.removeEventListener("pointerdown", markInteracting);
      viewport.removeEventListener("pointerup", scheduleResume);
      viewport.removeEventListener("pointercancel", scheduleResume);
      viewport.removeEventListener("pointerleave", scheduleResume);
      viewport.removeEventListener("touchstart", markInteracting);
      viewport.removeEventListener("touchend", scheduleResume);
      viewport.removeEventListener("touchcancel", scheduleResume);
      viewport.removeEventListener("scroll", scheduleResume);
      ro.disconnect();
      cancelAnimationFrame(measureRaf1);
      cancelAnimationFrame(measureRaf2);
      if (mobileRafRef.current) cancelAnimationFrame(mobileRafRef.current);
    };
  }, [isDesktop]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    if (!isDesktop) return;

    const reduceMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reduceMotion) return;

    const updateLoopWidth = () => {
      // Track contains 2 identical sets.
      loopWidthRef.current = Math.floor(track.scrollWidth / 2);
      if (loopWidthRef.current > 0) {
        // Normalize offset into [-loopWidth, 0)
        const loop = loopWidthRef.current;
        offsetXRef.current = ((offsetXRef.current % loop) + loop) % loop;
        if (offsetXRef.current > 0) offsetXRef.current -= loop;
        track.style.transform = `translate3d(${offsetXRef.current}px, 0, 0)`;
      }
    };

    updateLoopWidth();
    const ro = new ResizeObserver(() => updateLoopWidth());
    ro.observe(track);

    const speedPxPerSecond = 18; // slow, continuous

    const tick = (ts: number) => {
      const loopWidth = loopWidthRef.current;
      if (loopWidth <= 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (isDraggingRef.current || isPausedByHoverRef.current) {
        lastTsRef.current = ts;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const last = lastTsRef.current || ts;
      lastTsRef.current = ts;
      const dt = Math.min(50, ts - last);

      // Decrease offset => content moves right-to-left.
      let next = offsetXRef.current - (speedPxPerSecond * dt) / 1000;
      if (next <= -loopWidth) next += loopWidth;
      offsetXRef.current = next;
      track.style.transform = `translate3d(${next}px, 0, 0)`;

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [isDesktop]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    if (!isDesktop) return;

    const normalizeOffset = (x: number) => {
      const loop = loopWidthRef.current;
      if (loop <= 0) return x;
      let next = ((x % loop) + loop) % loop;
      if (next > 0) next -= loop;
      return next;
    };

    const onPointerDown = (e: PointerEvent) => {
      // Desktop: mouse-only dragging (mobile uses native horizontal scroll).
      if (e.pointerType !== "mouse") return;
      if (e.button !== 0) return;

      // Only allow dragging when the user starts the gesture on a reel card.
      if (!(e.target instanceof Element)) return;
      if (!e.target.closest('[data-reel-card="true"]')) return;

      isDraggingRef.current = true;
      dragStartXRef.current = e.clientX;
      dragStartOffsetRef.current = offsetXRef.current;
      try {
        viewport.setPointerCapture(e.pointerId);
      } catch {
        // Ignore if capture fails.
      }
      e.preventDefault();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - dragStartXRef.current;
      const next = normalizeOffset(dragStartOffsetRef.current + dx);
      offsetXRef.current = next;
      track.style.transform = `translate3d(${next}px, 0, 0)`;
      e.preventDefault();
    };

    const endDrag = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      try {
        viewport.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore.
      }
    };

    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    viewport.addEventListener("pointerleave", endDrag);

    return () => {
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", endDrag);
      viewport.removeEventListener("pointercancel", endDrag);
      viewport.removeEventListener("pointerleave", endDrag);
    };
  }, [isDesktop]);

  return (
    <section className="w-full flex-1 min-h-0 overflow-hidden bg-[#0a0a0a] relative pb-1 md:pb-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 md:w-16 bg-gradient-to-r from-[#0a0a0a] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 md:w-16 bg-gradient-to-l from-[#0a0a0a] to-transparent" />

      {isDesktop ? (
        <div
          ref={viewportRef}
          className="no-scrollbar h-full min-h-0 overflow-hidden px-6 md:px-12"
          style={{ touchAction: "pan-y" }}
          onWheel={(e) => {
            // Desktop: wheel should not move the carousel.
            e.preventDefault();
          }}
        >
          <div ref={trackRef} className="h-full min-h-0 flex items-start gap-3 md:gap-4 w-max will-change-transform">
            {loopedVideos.map((video, idx) => (
              <ReelVideoCard
                key={`${video.id}-${idx}`}
                video={video}
                rootRef={viewportRef}
                onHoverChange={(isHovering) => {
                  isPausedByHoverRef.current = isHovering;
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div ref={viewportRef} className="no-scrollbar h-full min-h-0 overflow-x-auto overflow-y-hidden px-6 md:px-12">
          <div ref={trackRef} className="h-full min-h-0 flex items-start gap-3 w-max">
            {loopedVideos.map((video, idx) => (
              <ReelVideoCard key={`${video.id}-${idx}`} video={video} rootRef={viewportRef} onHoverChange={() => {}} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
