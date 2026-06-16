"use client";

import type { ReactNode } from "react";
import { MusicPlayer } from "@/components/music-player-bar";

function IconButton({
  label,
  href,
  children,
}: {
  label: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="p-2.5 rounded-md border border-gray-800 hover:border-gray-700 text-gray-300"
    >
      {children}
    </a>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="6" y="6" width="12" height="12" rx="3" />
      <circle cx="12" cy="12" r="3.2" />
      <circle cx="16.2" cy="7.8" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="5.5" y="8" width="13" height="8" rx="2" />
      <path d="M11 10.2v3.6l3-1.8-3-1.8Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function HeroSection() {
  return (
    <header className="w-full bg-[#0a0a0a] p-[18px] flex flex-col items-stretch gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:sticky lg:top-0 z-40">
      {/* Mobile: centered contact line on top */}
      <p className="lg:hidden text-center text-sm tracking-[0.12em] uppercase text-gray-200 leading-none">
        Contact me <span className="text-gray-400">byanttipark@gmail.com</span>
      </p>

      {/* Title: centered + stacked on mobile, inline baseline on desktop */}
      <div className="flex flex-col items-center text-center gap-1 lg:flex-row lg:items-baseline lg:text-left lg:gap-5 shrink-0">
        <h1 className="text-[clamp(3rem,17.5vw,6rem)] lg:text-9xl font-normal tracking-tight leading-none">ANTTIPARK</h1>
        <p className="text-base md:text-3xl text-gray-400 tracking-wide leading-none">Visual Designer</p>
      </div>

      {/* Desktop: player */}
      <div className="hidden lg:block">
        <MusicPlayer />
      </div>

      {/* Desktop: socials + contact */}
      <div className="hidden lg:flex items-center gap-6 shrink-0">
        <div className="flex items-center gap-3 text-gray-300">
          <IconButton label="Instagram" href="https://www.instagram.com/byanttipark/">
            <InstagramIcon className="w-8 h-8" />
          </IconButton>
        </div>

        <div className="text-right leading-none">
          <p className="text-xl md:text-2xl text-gray-200 tracking-wide">Contact me</p>
          <p className="text-lg md:text-xl text-gray-400 tracking-wide leading-none">byanttipark@gmail.com</p>
        </div>
      </div>

      {/* Mobile: player */}
      <div className="w-full lg:hidden">
        <MusicPlayer />
      </div>
    </header>
  );
}
