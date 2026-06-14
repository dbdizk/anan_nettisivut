"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { reelVideos, type Video } from "@/data/projects";

function ReelVideoCard({
  video,
  rootRef,
  highQuality,
  onHoverChange,
}: {
  video: Video;
  rootRef: RefObject<HTMLDivElement | null>;
  highQuality: boolean;
  onHoverChange: (isHovering: boolean) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Desktop plays the full-quality original (better colors); phones keep the
  // lighter optimized clip. The poster covers the load until playback starts.
  const source = highQuality && video.srcHigh ? video.srcHigh : video.src;

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
    // `source` is included so playback re-initializes (and resumes) when the
    // quality swaps between the optimized and full-quality file.
  }, [rootRef, video.clipEnd, video.clipStart, source]);

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
        key={source}
        className="h-full w-full object-cover transition-[filter] duration-300 ease-out group-hover:blur-sm group-hover:brightness-75"
        muted
        playsInline
        loop
        preload={highQuality ? "metadata" : "auto"}
        poster={video.poster}
        src={source}
      />
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

  // Release momentum: extra fling velocity (px/ms) that decays back into the
  // baseline drift, so the carousel coasts to a stop instead of stopping dead.
  const momentumRef = useRef<number>(0);
  const dragVelocityRef = useRef<number>(0);
  const lastMoveXRef = useRef<number>(0);
  const lastMoveTRef = useRef<number>(0);

  const loopedVideos = useMemo(() => [...reelVideos, ...reelVideos], []);

  // PC (>=1024px) plays the full-quality originals; phones/tablets keep the
  // lighter optimized clips. Defaults to false so SSR matches the mobile output.
  const [highQuality, setHighQuality] = useState(false);

  useEffect(() => {
    const mq = globalThis.matchMedia?.("(min-width: 1024px)");
    if (!mq) return;
    const apply = () => setHighQuality(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

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

    const speedPxPerSecond = 18; // slow, continuous baseline drift
    const MOMENTUM_FRICTION = 0.94; // per ~16.67ms frame; lower = stops sooner

    const tick = (ts: number) => {
      const loopWidth = loopWidthRef.current;
      if (loopWidth <= 0) {
        updateLoopWidth();
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (isDraggingRef.current) {
        lastTsRef.current = ts;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const last = lastTsRef.current || ts;
      lastTsRef.current = ts;
      const dt = Math.min(50, ts - last);

      // Ease the leftover fling velocity toward zero (frame-rate independent).
      if (momentumRef.current !== 0) {
        momentumRef.current *= Math.pow(MOMENTUM_FRICTION, dt / 16.667);
        if (Math.abs(momentumRef.current) < 0.003) momentumRef.current = 0;
      }

      // Baseline auto-drift (right-to-left) pauses while hovering (desktop) or
      // with reduced motion — but a fling still coasts to a stop either way.
      const baseline = reduceMotion || isPausedByHoverRef.current ? 0 : -speedPxPerSecond / 1000;
      const velocity = baseline + momentumRef.current; // px per ms
      if (velocity !== 0) {
        offsetXRef.current = normalizeOffset(offsetXRef.current + velocity * dt);
        track.style.transform = `translate3d(${offsetXRef.current}px, 0, 0)`;
      }

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

      // Grabbing cancels any ongoing fling and resets velocity tracking.
      momentumRef.current = 0;
      dragVelocityRef.current = 0;
      lastMoveXRef.current = e.clientX;
      lastMoveTRef.current = e.timeStamp;
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

      // Track pointer velocity (px/ms) with light smoothing, for release momentum.
      const moveDt = e.timeStamp - lastMoveTRef.current;
      if (moveDt > 0) {
        const instantV = (e.clientX - lastMoveXRef.current) / moveDt;
        dragVelocityRef.current = dragVelocityRef.current * 0.6 + instantV * 0.4;
        lastMoveXRef.current = e.clientX;
        lastMoveTRef.current = e.timeStamp;
      }

      offsetXRef.current = normalizeOffset(dragStartOffsetRef.current + dx);
      track.style.transform = `translate3d(${offsetXRef.current}px, 0, 0)`;
      e.preventDefault();
    };

    const MAX_FLING = 3; // px/ms cap so a hard flick can't launch it absurdly fast

    const endDrag = (e: PointerEvent) => {
      if (dragPointerIdRef.current !== e.pointerId) return;
      const wasDragging = isDraggingRef.current;
      isDraggingRef.current = false;
      pendingDragRef.current = false;
      dragPointerIdRef.current = null;
      try {
        viewport.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore.
      }

      if (!wasDragging) return;
      // Carry the release velocity as momentum — unless the pointer was held
      // still just before letting go (then it should simply stop where it is).
      const idleMs = e.timeStamp - lastMoveTRef.current;
      momentumRef.current =
        idleMs > 80 ? 0 : Math.max(-MAX_FLING, Math.min(MAX_FLING, dragVelocityRef.current));
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
