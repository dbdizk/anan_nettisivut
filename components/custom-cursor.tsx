"use client";

import { motion, useSpring } from "framer-motion";
import { useEffect } from "react";

export function CustomCursor() {
  const x = useSpring(-100, { stiffness: 250, damping: 28, mass: 0.6 });
  const y = useSpring(-100, { stiffness: 250, damping: 28, mass: 0.6 });

  useEffect(() => {
    const move = (event: MouseEvent) => {
      x.set(event.clientX - 10);
      y.set(event.clientY - 10);
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden={true}
      className="pointer-events-none fixed z-50 hidden h-5 w-5 rounded-full border border-zinc-300/60 mix-blend-difference md:block"
      style={{ x, y }}
    />
  );
}
