import { AboutSection } from "@/components/about-section";
import { CustomCursor } from "@/components/custom-cursor";
import { FooterSection } from "@/components/footer-section";
import { HeroSection } from "@/components/hero-section";
import { ProjectGrid } from "@/components/project-grid";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <CustomCursor />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-28 px-6 py-12 md:px-12 md:py-20">
        <HeroSection />
        <ProjectGrid />
        <AboutSection />
        <FooterSection />
      </main>
    </div>
  );
}
