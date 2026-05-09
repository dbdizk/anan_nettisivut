"use client";

import { motion, useScroll, useTransform } from "framer-motion";

import { MagneticButton } from "@/components/magnetic-button";
import { Reveal } from "@/components/reveal";

export function HeroSection() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.4], [0, -38]);

  return (
    <Reveal className="grid gap-10 border-b border-zinc-800 pb-16 md:grid-cols-12 md:pb-20">
      <motion.div className="space-y-6 md:col-span-8" style={{ y }}>
        <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
          Frontend Engineer · Helsinki
        </p>
        <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.03em] text-zinc-100 sm:text-6xl lg:text-7xl">
          I build quiet digital products with precise motion and clear purpose.
        </h1>
      </motion.div>
      <div className="flex flex-col items-start justify-end gap-6 md:col-span-4">
        <p className="max-w-sm text-lg leading-relaxed text-zinc-400">
          A minimalist portfolio focused on storytelling, interaction quality, and
          crafted frontend systems.
        </p>
        <MagneticButton href="#projects" label="View selected work" />
      </div>
    </Reveal>
  );
}
