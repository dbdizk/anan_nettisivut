"use client";

import type { ReactNode } from "react";

function IconButton({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="p-2.5 rounded-md border border-gray-800 hover:border-gray-700 text-gray-300"
    >
      {children}
    </button>
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

function TiktokIcon({ className }: { className?: string }) {
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
      <path d="M14 6v9.1a3.3 3.3 0 1 1-2.2-3.1" />
      <path d="M14 6c.7 2.2 2.4 3.7 4.5 4" />
    </svg>
  );
}

export function HeroSection() {
  return (
    <header className="w-full bg-[#0a0a0a] p-[18px] flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-baseline gap-5">
        <h1 className="text-7xl md:text-8xl lg:text-9xl font-normal tracking-tight leading-none">ANTTIPARK</h1>
        <p className="text-xl md:text-3xl text-gray-400 tracking-wide leading-none">Visual Designer</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 text-gray-300">
          <IconButton label="TikTok">
            <TiktokIcon className="w-8 h-8" />
          </IconButton>
          <IconButton label="YouTube">
            <YoutubeIcon className="w-8 h-8" />
          </IconButton>
          <IconButton label="Instagram">
            <InstagramIcon className="w-8 h-8" />
          </IconButton>
        </div>

        <div className="text-right leading-none">
          <p className="text-xl md:text-2xl text-gray-200 tracking-wide">Contact me</p>
          <p className="text-lg md:text-xl text-gray-400 tracking-wide leading-none">byanttipark@gmail.com</p>
        </div>
      </div>
    </header>
  );
}
