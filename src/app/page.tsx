import React from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { AwardIntroSection } from "@/components/home/AwardIntroSection";
import { FeaturedCategoriesSection } from "@/components/home/FeaturedCategoriesSection";
import { WhyParticipateSection } from "@/components/home/WhyParticipateSection";
import { JourneyToRecognition } from "@/components/home/JourneyToRecognition";
import { EvaluationMethodologySection } from "@/components/home/EvaluationMethodologySection";
import { JuryPreviewSection } from "@/components/home/JuryPreviewSection";
import { FinalCtaSection } from "@/components/home/FinalCtaSection";

export default function Home() {
  return (
    <main className="flex-1">
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. About / Awards Introduction */}
      <AwardIntroSection />

      {/* 3. Featured Award Categories (6 Categories) */}
      <FeaturedCategoriesSection />

      {/* 4. Why Participate / Why Nominate */}
      <WhyParticipateSection />

      {/* 5. Journey to Recognition (Timeline Roadmap) */}
      <JourneyToRecognition />

      {/* 6. Evaluation Methodology (5 Criteria & 1–10 Scale) */}
      <EvaluationMethodologySection />

      {/* 7. Jury Preview */}
      <JuryPreviewSection />

      {/* 8. Final CTA */}
      <FinalCtaSection />
    </main>
  );
}

