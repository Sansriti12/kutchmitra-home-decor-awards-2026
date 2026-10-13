import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPublicSiteSettings } from "@/lib/cms/public";
import { HeroSection } from "@/components/home/HeroSection";
import { AwardIntroSection } from "@/components/home/AwardIntroSection";
import { FeaturedCategoriesSection } from "@/components/home/FeaturedCategoriesSection";
import { WhyParticipateSection } from "@/components/home/WhyParticipateSection";
import { JourneyToRecognition } from "@/components/home/JourneyToRecognition";
import { EvaluationMethodologySection } from "@/components/home/EvaluationMethodologySection";
import { JuryPreviewSection } from "@/components/home/JuryPreviewSection";
import { FinalCtaSection } from "@/components/home/FinalCtaSection";

export const revalidate = 60; // ISR cache revalidation

export default async function Home() {
  const siteSettings = await getPublicSiteSettings();

  return (
    <main className="flex-1">
      {/* CMS Homepage Announcement Notice Strip */}
      {siteSettings.homepageBannerActive && (
        <aside className="bg-navy-950 text-white border-b border-gold-500/40 py-2.5 px-4 font-sans text-xs">
          <div className="container-editorial flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <span className="px-2 py-0.5 bg-gold-500 text-navy-950 font-mono text-[10px] font-bold uppercase tracking-wider">
                {siteSettings.homepageBannerBadge || "ANNOUNCEMENT"}
              </span>
              <span className="text-slate-200 text-xs font-medium">
                {siteSettings.homepageBannerText}
              </span>
            </div>
            {siteSettings.homepageBannerLink && siteSettings.homepageBannerLinkText && (
              <Link
                href={siteSettings.homepageBannerLink}
                className="text-gold-400 hover:text-gold-300 font-mono text-xs font-semibold inline-flex items-center gap-1 transition-colors flex-shrink-0"
              >
                <span>{siteSettings.homepageBannerLinkText}</span>
                <ArrowRight size={12} />
              </Link>
            )}
          </div>
        </aside>
      )}

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

      {/* 6. Evaluation Methodology (5 Core Criteria) */}
      <EvaluationMethodologySection />

      {/* 7. Jury Preview */}
      <JuryPreviewSection />

      {/* 8. Final CTA */}
      <FinalCtaSection />
    </main>
  );
}
