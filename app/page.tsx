import { HeroSection } from "@/components/hero-section";
import { ReelSection } from "@/components/reel-section";
import { AboutView } from "@/components/about-view";
import { TwoViewShell } from "@/components/two-view-shell";

export default function Home() {
  return (
    <TwoViewShell
      landing={
        <div className="relative w-full h-screen flex flex-col bg-[#0a0a0a] text-white overflow-hidden">
          <HeroSection />
          <ReelSection />

          <footer className="shrink-0 w-full px-6 md:px-12 min-h-10 pt-0 pb-0 md:min-h-0 md:pb-6 md:pt-4 flex flex-col items-center justify-center">
            <div className="text-gray-200 tracking-[0.3em] text-sm md:text-base">ABOUT ME</div>
            <div className="mt-0 md:mt-2 text-gray-400 animate-float">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </footer>
        </div>
      }
      about={<AboutView />}
    />
  );
}
