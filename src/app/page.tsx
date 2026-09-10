import React from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { AwardIntroSection } from "@/components/home/AwardIntroSection";
import { FeaturedCategoriesSection } from "@/components/home/FeaturedCategoriesSection";
import { WhyParticipateSection } from "@/components/home/WhyParticipateSection";
import { HowToNominatePreview } from "@/components/home/HowToNominatePreview";
import { ImportantDatesPreview } from "@/components/home/ImportantDatesPreview";
import { JuryPreviewSection } from "@/components/home/JuryPreviewSection";
import { FinalCtaSection } from "@/components/home/FinalCtaSection";

export default function Home() {
  return (
    <main className="flex-1">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Short Award Introduction */}
      <AwardIntroSection />

      {/* 3. Featured Category Preview (6 Categories) */}
      <FeaturedCategoriesSection />

      {/* 4. Short Recognition / Why Participate Section */}
      <WhyParticipateSection />

      {/* 5. Short How-to-Nominate Preview (4-Step Flow) */}
      <HowToNominatePreview />

      {/* 6. Important Dates Preview (Timeline Roadmap — TBD) */}
      <ImportantDatesPreview />

      {/* 7. Jury Preview */}
      <JuryPreviewSection />

      {/* 8. Final CTA */}
      <FinalCtaSection />
    </main>
  );
}
