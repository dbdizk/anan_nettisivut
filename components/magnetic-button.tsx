"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";

type MagneticButtonProps = {
  href: string;
  label: string;
};

export function MagneticButton({ href, label }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  const handleMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    ref.current.style.transform = `translate(${x * 0.14}px, ${y * 0.14}px)`;
  };

  const reset = () => {
    if (!ref.current) return;
    ref.current.style.transform = "translate(0px, 0px)";
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      whileTap={{ scale: 0.97 }}
      className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-900 px-6 py-3 text-sm tracking-[0.08em] text-zinc-100 transition-[transform,border-color,background-color] duration-300 hover:border-zinc-400 hover:bg-zinc-800/70"
    >
      {label}
      <ArrowUpRight size={16} />
    </motion.a>
  );
}
