import React from "react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { EditorialLink } from "@/components/ui/EditorialLink";
import { Award, Eye, Compass, Sparkles } from "lucide-react";

export function WhyParticipateSection() {
  const PILLARS = [
    {
      title: "Recognition",
      description: "Earn formal honors for design thinking, spatial rigor, and professional dedication.",
    },
    {
      title: "Showcasing Work",
      description: "Present completed architectural and interior projects through a curated digital portfolio.",
    },
    {
      title: "Professional Visibility",
      description: "Gain dedicated platform visibility among peers, industry contemporaries, and design circles.",
    },
    {
      title: "Celebrating Craftsmanship",
      description: "Highlight intelligent materiality, detailing, and refined execution in built residential work.",
    },
  ];

  return (
    <section className="bg-[#FBFAF7] py-12 sm:py-16 border-b border-navy-900/10">
      <div className="container-editorial">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Heading & Intro (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <SectionMarker number="03" label="Participation" theme="light" />
            <h2 className="heading-editorial text-navy-900 leading-tight">
              Why Submit Your Work
            </h2>
            <p className="body-editorial text-[#4A4F5C]">
              A peer-reviewed platform dedicated to documenting and honoring excellence in residential architecture and interior design.
            </p>
            <div className="pt-1">
              <EditorialLink href="/about" theme="light" showArrow>
                Why Participate
              </EditorialLink>
            </div>
          </div>

          {/* Right: 4 Compact Pillars (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PILLARS.map((pillar, idx) => (
              <div
                key={idx}
                className="p-5 bg-white border border-navy-900/10 space-y-1.5 hover:border-gold-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg text-navy-900 font-medium">
                    {pillar.title}
                  </span>
                  <span className="font-mono text-[11px] text-gold-600 font-semibold">
                    0{idx + 1}
                  </span>
                </div>
                <p className="text-xs text-[#4A4F5C] font-sans leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
