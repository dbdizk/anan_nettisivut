import Image from "next/image";
import type { ReactNode } from "react";

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
      className="p-2.5 rounded-md border border-gray-800 hover:border-gray-700 bg-black/40 hover:bg-black/55 text-gray-300 shadow-sm shadow-black/30 hover:shadow-black/50"
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

export function AboutView() {
  return (
    <div className="relative min-h-screen lg:h-screen w-full bg-[#0a0a0a] text-white overflow-x-hidden overflow-y-auto lg:overflow-hidden">
      <div className="pointer-events-none absolute inset-0 hidden lg:block overflow-hidden">
        <div className="h-full w-[200%] flex motion-reduce:animate-none animate-about-bg opacity-20">
          <div
            className="h-full w-1/2 bg-cover bg-center"
            style={{ backgroundImage: "url('/bg/nettisivu%20tausta%202.png')" }}
          />
          <div
            className="h-full w-1/2 bg-cover bg-center"
            style={{ backgroundImage: "url('/bg/nettisivu%20tausta%202.png')" }}
          />
        </div>
      </div>

      <div className="relative h-full w-full p-[18px] pt-10 pb-14 md:pt-[18px] md:pb-[18px] flex items-start lg:items-center justify-center">
        <div className="w-full px-0 md:px-12 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start gap-8 md:gap-14">
            <div className="w-full max-w-[320px] mx-auto md:max-w-none md:mx-0 md:w-[420px] lg:w-[520px] shrink-0">
              <div className="relative w-full aspect-[4/5] overflow-hidden rounded-lg border border-gray-800">
                <Image
                  src="/images/portrait.png"
                  alt="Portrait"
                  fill
                  sizes="(min-width: 1024px) 520px, (min-width: 768px) 420px, 90vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight leading-none lg:mt-[-9px] mt-1 md:mt-0">
                ABOUT ME
              </h2>
              <div className="mt-5 md:mt-6 max-w-[56ch] text-lg md:text-xl text-gray-300 leading-relaxed space-y-5 md:space-y-6">
                <p>
                  I’m a creative based in Helsinki, working with graphic design, video, and music. I build modern
                  visuals that feel clean and convey emotion. My inspiration comes from music, internet culture, and
                  personal experiences. I collaborate with brands and artists who value strong visual identity.
                </p>

                <div className="pt-2 flex flex-col gap-4">
                  <div className="flex items-center gap-3 text-gray-300">
                    <IconButton label="TikTok" href="https://www.tiktok.com/@byanttipark">
                      <TiktokIcon className="w-7 h-7 md:w-8 md:h-8" />
                    </IconButton>
                    <IconButton label="YouTube" href="https://www.youtube.com/@byanttipark">
                      <YoutubeIcon className="w-7 h-7 md:w-8 md:h-8" />
                    </IconButton>
                    <IconButton label="Instagram" href="https://www.instagram.com/byanttipark/">
                      <InstagramIcon className="w-7 h-7 md:w-8 md:h-8" />
                    </IconButton>
                  </div>

                  <div className="text-base md:text-lg text-gray-400 tracking-wide leading-none">byanttipark@gmail.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
