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
    <header className="w-full bg-[#0a0a0a] p-[18px] flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:sticky lg:top-0 z-40">
      <div className="flex items-baseline gap-3 sm:gap-5 shrink-0">
        <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-normal tracking-tight leading-none">ANTTIPARK</h1>
        <p className="text-sm sm:text-base md:text-3xl text-gray-400 tracking-wide leading-none">Visual Designer</p>
      </div>

      {/* Desktop: keep the existing layout */}
      <div className="hidden lg:block">
        <MusicPlayer />
      </div>

      <div className="hidden lg:flex items-center gap-6 shrink-0">
        <div className="flex items-center gap-3 text-gray-300">
          <IconButton label="YouTube" href="https://www.youtube.com/@byanttipark">
            <YoutubeIcon className="w-8 h-8" />
          </IconButton>
          <IconButton label="Instagram" href="https://www.instagram.com/byanttipark/">
            <InstagramIcon className="w-8 h-8" />
          </IconButton>
        </div>

        <div className="text-right leading-none">
          <p className="text-xl md:text-2xl text-gray-200 tracking-wide">Contact me</p>
          <p className="text-lg md:text-xl text-gray-400 tracking-wide leading-none">byanttipark@gmail.com</p>
        </div>
      </div>

      {/* Mobile: socials + email, then player */}
      <div className="w-full flex flex-col gap-3 lg:hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 text-gray-300">
            <IconButton label="YouTube" href="https://www.youtube.com/@byanttipark">
              <YoutubeIcon className="w-7 h-7" />
            </IconButton>
            <IconButton label="Instagram" href="https://www.instagram.com/byanttipark/">
              <InstagramIcon className="w-7 h-7" />
            </IconButton>
          </div>

          <div className="text-right leading-none">
            <p className="text-base text-gray-200 tracking-wide">Contact me</p>
            <p className="text-sm text-gray-400 tracking-wide leading-none">byanttipark@gmail.com</p>
          </div>
        </div>

        <MusicPlayer />
      </div>
    </header>
  );
}
