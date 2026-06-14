"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
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
        // Generous horizontal margin gives hysteresis: a card starts playing just
        // before it scrolls into view and only pauses once it's well off-screen,
        // which prevents play/pause flapping (and the stutter that causes).
        rootMargin: "0px 50% 0px 50%",
        threshold: 0,
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
      className="group flex-shrink-0 h-[clamp(20.5rem,66vh,46rem)] md:h-[max(22rem,68vh)] lg:h-[91.5%] aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden relative cursor-grab active:cursor-grabbing"
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
        preload="auto"
        poster={video.poster}
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

  const isPausedByHoverRef = useRef(false);

  // Pointer drag (mouse + touch). We only hijack horizontal gestures so vertical
  // swipes keep scrolling the page on mobile.
  const isDraggingRef = useRef(false);
  const pendingDragRef = useRef(false);
  const dragPointerIdRef = useRef<number | null>(null);
  const dragStartXRef = useRef<number>(0);
  const dragStartYRef = useRef<number>(0);
  const dragStartOffsetRef = useRef<number>(0);

  const loopedVideos = useMemo(() => [...reelVideos, ...reelVideos], []);

  // Keep the transform offset within [-loopWidth, 0) so the duplicated track
  // loops seamlessly in either direction.
  const normalizeOffset = (x: number) => {
    const loop = loopWidthRef.current;
    if (loop <= 0) return x;
    let next = ((x % loop) + loop) % loop;
    if (next > 0) next -= loop;
    return next;
  };

  // Continuous auto-scroll via translate3d (same technique on every breakpoint).
  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const reduceMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const updateLoopWidth = () => {
      // The track holds 2 identical sets; the start of the 2nd set is exactly one
      // loop width (this avoids flex-gap drift you'd get from scrollWidth / 2).
      const cards = track.querySelectorAll<HTMLElement>('[data-reel-card="true"]');
      const marker = cards[reelVideos.length];
      const byMarker = marker?.offsetLeft ?? 0;
      loopWidthRef.current = byMarker > 0 ? byMarker : Math.floor(track.scrollWidth / 2);
      if (loopWidthRef.current > 0) {
        offsetXRef.current = normalizeOffset(offsetXRef.current);
        track.style.transform = `translate3d(${offsetXRef.current}px, 0, 0)`;
      }
    };

    // Measure a few times to catch late layout / media sizing.
    updateLoopWidth();
    const measureRaf1 = requestAnimationFrame(updateLoopWidth);
    const measureRaf2 = requestAnimationFrame(() => requestAnimationFrame(updateLoopWidth));

    const ro =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => updateLoopWidth());
    ro?.observe(track);

    const speedPxPerSecond = 18; // slow, continuous

    const tick = (ts: number) => {
      const loopWidth = loopWidthRef.current;
      if (loopWidth <= 0) {
        updateLoopWidth();
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (reduceMotion || isDraggingRef.current || isPausedByHoverRef.current) {
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
      cancelAnimationFrame(measureRaf1);
      cancelAnimationFrame(measureRaf2);
      ro?.disconnect();
    };
  }, []);

  // Drag to scrub the carousel (mouse and touch), both directions.
  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const DRAG_THRESHOLD = 6; // px of intent before we commit to a horizontal drag

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (!(e.target instanceof Element)) return;
      if (!e.target.closest('[data-reel-card="true"]')) return;

      pendingDragRef.current = true;
      isDraggingRef.current = false;
      dragPointerIdRef.current = e.pointerId;
      dragStartXRef.current = e.clientX;
      dragStartYRef.current = e.clientY;
      dragStartOffsetRef.current = offsetXRef.current;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (dragPointerIdRef.current !== e.pointerId) return;

      const dx = e.clientX - dragStartXRef.current;
      const dy = e.clientY - dragStartYRef.current;

      // Decide intent: only capture if the gesture is clearly horizontal, so a
      // vertical swipe is left to the browser (page scroll on mobile).
      if (pendingDragRef.current && !isDraggingRef.current) {
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
        if (Math.abs(dy) >= Math.abs(dx)) {
          pendingDragRef.current = false;
          dragPointerIdRef.current = null;
          return;
        }
        isDraggingRef.current = true;
        pendingDragRef.current = false;
        try {
          viewport.setPointerCapture(e.pointerId);
        } catch {
          // Ignore if capture fails.
        }
      }

      if (!isDraggingRef.current) return;
      offsetXRef.current = normalizeOffset(dragStartOffsetRef.current + dx);
      track.style.transform = `translate3d(${offsetXRef.current}px, 0, 0)`;
      e.preventDefault();
    };

    const endDrag = (e: PointerEvent) => {
      if (dragPointerIdRef.current !== e.pointerId) return;
      isDraggingRef.current = false;
      pendingDragRef.current = false;
      dragPointerIdRef.current = null;
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
  }, []);

  return (
    <section className="w-full flex-none lg:flex-1 min-h-0 overflow-hidden bg-[#0a0a0a] relative pb-0">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 md:w-16 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 md:w-16 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10" />

      <div
        ref={viewportRef}
        className="no-scrollbar h-auto lg:h-full lg:min-h-0 overflow-hidden px-6 md:px-12"
        style={{ touchAction: "pan-y" }}
      >
        <div
          ref={trackRef}
          className="h-auto lg:h-full lg:min-h-0 flex items-start gap-3 md:gap-4 w-max will-change-transform"
        >
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
    </section>
  );
}
