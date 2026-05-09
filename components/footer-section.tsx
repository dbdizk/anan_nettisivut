"use client";

import { GitBranch, Link2, Mail } from "lucide-react";

import { Reveal } from "@/components/reveal";

const socials = [
  { href: "https://github.com", label: "GitHub", icon: GitBranch },
  { href: "https://linkedin.com", label: "LinkedIn", icon: Link2 },
  { href: "mailto:hello@example.com", label: "Email", icon: Mail },
];

export function FooterSection() {
  return (
    <Reveal>
      <footer className="mt-2 grid gap-8 border-t border-zinc-800 py-10 md:grid-cols-2 md:items-center">
        <div className="flex flex-wrap gap-5 text-sm text-zinc-400">
          {socials.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              className="inline-flex items-center gap-2 transition-colors hover:text-zinc-100"
              target="_blank"
              rel="noreferrer"
            >
              <Icon size={16} />
              {label}
            </a>
          ))}
        </div>
        <div className="flex items-center justify-start gap-3 text-sm text-zinc-300 md:justify-end">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          Currently available for work
        </div>
      </footer>
    </Reveal>
  );
}
