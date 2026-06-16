"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type TwoViewShellProps = {
  landing: ReactNode;
  about: ReactNode;
};

export function TwoViewShell({ landing, about }: TwoViewShellProps) {
  const [viewIndex, setViewIndex] = useState<0 | 1>(0);
  const viewIndexRef = useRef<0 | 1>(0);
  const isAnimatingRef = useRef(false);

  const [isDesktop, setIsDesktop] = useState(false);

  const touchStartYRef = useRef<number | null>(null);

  const prefersReducedMotion = useMemo(() => {
    return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  }, []);

  useEffect(() => {
    const mq = globalThis.matchMedia?.("(min-width: 1024px)");
    if (!mq) return;

    const apply = () => {
      setIsDesktop(mq.matches);
      if (!mq.matches) {
        // When dropping to mobile, ensure we are visually at the top.
        viewIndexRef.current = 0;
        setViewIndex(0);
        isAnimatingRef.current = false;
      }
    };

    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const goTo = (next: 0 | 1) => {
    if (viewIndexRef.current === next) return;
    if (isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    viewIndexRef.current = next;
    setViewIndex(next);

    if (prefersReducedMotion) {
      isAnimatingRef.current = false;
    }
  };

  useEffect(() => {
    // Mobile: allow normal scrolling (no locked glide behavior).
    if (!isDesktop) return;

    const onWheel = (e: WheelEvent) => {
      // Always prevent the native page scroll; we only allow 2 locked views.
      e.preventDefault();

      if (isAnimatingRef.current) return;

      const dy = e.deltaY;
      const dx = e.deltaX;
      if (Math.abs(dy) < Math.abs(dx)) return;
      if (Math.abs(dy) < 1) return;

      const isDown = dy > 0;
      const isUp = dy < 0;

      if (viewIndexRef.current === 0 && isDown) goTo(1);
      if (viewIndexRef.current === 1 && isUp) goTo(0);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      touchStartYRef.current = e.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (e: TouchEvent) => {
      // Prevent native page scroll / rubber-banding.
      if (e.touches.length === 1) e.preventDefault();
    };

    const onTouchEnd = (e: TouchEvent) => {
      const startY = touchStartYRef.current;
      touchStartYRef.current = null;
      if (startY == null) return;

      const endY = e.changedTouches[0]?.clientY;
      if (typeof endY !== "number") return;

      const dy = endY - startY;
      const threshold = 28;
      if (Math.abs(dy) < threshold) return;

      const swipeDown = dy > 0;
      const swipeUp = dy < 0;

      // Swipe up == scroll down.
      if (viewIndexRef.current === 0 && swipeUp) goTo(1);
      if (viewIndexRef.current === 1 && swipeDown) goTo(0);
    };

    // Capture to beat nested handlers.
    globalThis.addEventListener("wheel", onWheel, { passive: false, capture: true });
    globalThis.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    globalThis.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    globalThis.addEventListener("touchend", onTouchEnd, { passive: true, capture: true });

    return () => {
      globalThis.removeEventListener("wheel", onWheel, true);
      globalThis.removeEventListener("touchstart", onTouchStart, true);
      globalThis.removeEventListener("touchmove", onTouchMove, true);
      globalThis.removeEventListener("touchend", onTouchEnd, true);
    };
  }, [isDesktop, prefersReducedMotion]);

  // Mobile: normal document flow scrolling.
  if (!isDesktop) {
    return (
      <div className="w-full">
        {landing}
        {about}
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden" style={{ overscrollBehavior: "none" }}>
      <div
        className={
          prefersReducedMotion
            ? "h-full w-full"
            : "h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        }
        style={{ transform: `translate3d(0, -${viewIndex * 100}vh, 0)` }}
        onTransitionEnd={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.propertyName !== "transform") return;
          isAnimatingRef.current = false;
        }}
      >
        <section className="h-screen w-full">{landing}</section>
        <section className="h-screen w-full">{about}</section>
      </div>
    </div>
  );
}
