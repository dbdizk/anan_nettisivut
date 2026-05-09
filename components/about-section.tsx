"use client";

import { Reveal } from "@/components/reveal";

export function AboutSection() {
  return (
    <section className="grid gap-10 border-t border-zinc-800 pt-16 md:grid-cols-12">
      <Reveal className="md:col-span-3">
        <h2 className="text-sm uppercase tracking-[0.18em] text-zinc-500">
          About / Experience
        </h2>
      </Reveal>

      <Reveal className="space-y-7 md:col-span-9">
        <p className="max-w-3xl text-xl leading-[1.95] text-zinc-300">
          I design and build interfaces where typography, spacing, and motion
          communicate as clearly as the content itself. Over the last years, I have
          shipped product experiences for startups and design-led teams across
          commerce, media, and collaboration tools.
        </p>
        <p className="max-w-3xl text-xl leading-[1.95] text-zinc-400">
          My work spans concept direction, design system architecture, and
          implementation in React/Next.js environments. I care about detail, calm
          interactions, and performance that feels invisible.
        </p>
      </Reveal>
    </section>
  );
}
