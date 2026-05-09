"use client";

import { motion, useSpring } from "framer-motion";
import { useEffect } from "react";

function EyeOfHorus({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 20c8-10 18-15 28-15s20 5 28 15c-8 10-18 15-28 15S12 30 4 20Z" />
      <circle cx="32" cy="20" r="6" />
      <path d="M18 34c6-2 10-6 14-12" />
      <path d="M46 34c-6-2-10-6-14-12" />
      <path d="M16 10c5 1 9 3 12 6" />
      <path d="M48 10c-5 1-9 3-12 6" />
      <path d="M30 26c-3 6-8 9-14 10" />
    </svg>
  );
}

export function CustomCursor() {
  const x = useSpring(-100, { stiffness: 300, damping: 30, mass: 0.6 });
  const y = useSpring(-100, { stiffness: 300, damping: 30, mass: 0.6 });

  useEffect(() => {
    const move = (event: MouseEvent) => {
      // Center the icon on the pointer.
      x.set(event.clientX - 22);
      y.set(event.clientY - 14);
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden={true}
      className="pointer-events-none fixed z-50 hidden text-zinc-200 mix-blend-difference md:block"
      style={{ x, y }}
    >
      <EyeOfHorus className="h-7 w-auto" />
    </motion.div>
  );
}
