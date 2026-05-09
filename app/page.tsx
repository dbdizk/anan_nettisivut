import { HeroSection } from "@/components/hero-section";
import { ReelSection } from "@/components/reel-section";

export default function Home() {
  return (
    <div className="relative w-full h-screen flex flex-col bg-[#0a0a0a] text-white overflow-hidden">
      <HeroSection />
      <ReelSection />
    </div>
  );
}
