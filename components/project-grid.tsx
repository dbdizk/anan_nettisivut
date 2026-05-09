"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/reveal";
import { projects } from "@/data/projects";

export function ProjectGrid() {
  return (
    <section id="projects" className="space-y-8">
      <Reveal>
        <h2 className="text-2xl tracking-[-0.02em] text-zinc-200 md:text-3xl">
          Selected Projects
        </h2>
      </Reveal>

      <div className="grid gap-5 md:grid-cols-2">
        {projects.map((project, index) => (
          <Reveal key={project.name}>
            <motion.a
              href={project.href}
              className="group flex h-full flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-950 p-7"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="space-y-3">
                <h3 className="text-xl tracking-[-0.01em] text-zinc-100">
                  {project.name}
                </h3>
                <p className="leading-relaxed text-zinc-400">{project.description}</p>
              </div>
              <div className="mt-8 flex items-center justify-between text-sm text-zinc-500">
                <span>{project.stack}</span>
                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
            </motion.a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
