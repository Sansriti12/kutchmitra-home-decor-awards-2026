import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Scale, EyeOff, ArrowRight } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { getApprovedJuryProfiles } from "@/lib/data/jury-profiles";
import { PublicJuryCard } from "@/components/jury/PublicJuryCard";

export const metadata: Metadata = {
  title: "Jury & Evaluation | Kutchmitra Home & Decor Awards 2026",
  description:
    "Meet our esteemed Grand Jury panel and explore the independent evaluation process and scoring framework for the Kutchmitra Home & Decor Awards 2026.",
};

export const revalidate = 60; // ISR cache revalidation

export default function JuryPage() {
  const jurors = getApprovedJuryProfiles();

  const PILLARS = [
    {
      title: "Design Excellence & Innovation",
      desc: "Aesthetic distinction, spatial clarity, design thinking, and novel conceptual or material approaches.",
    },
    {
      title: "Functionality & Usability",
      desc: "Liveability, intelligent circulation, human comfort, and responsiveness to occupants' lifestyle.",
    },
    {
      title: "Quality of Craftsmanship & Execution",
      desc: "Structural coherence, precision detailing, finishing craftsmanship, and superior execution quality.",
    },
    {
      title: "Sustainability & Material Sensitivity",
      desc: "Resource efficiency, passive climate response, natural daylighting, and environmentally responsible practices.",
    },
    {
      title: "Contextual Relevance & Cultural Harmony",
      desc: "Distinctiveness, cultural heritage integration, lasting spatial contribution, and regional architectural resonance.",
    },
  ];

  return (
    <main className="flex-1 bg-ivory text-navy-900">
      {/* Banner */}
      <section className="py-8 sm:py-10 lg:py-12 border-b border-navy-900/10 bg-[#FBFAF7]">
        <div className="container-editorial space-y-4 sm:space-y-5">
          <SectionMarker number="01" label="Independent Assessment" theme="light" />
          <h1 className="heading-display text-navy-900 max-w-3xl text-3xl sm:text-4xl lg:text-5xl">
            The Grand Jury &amp; Evaluation Framework
          </h1>
          <p className="body-editorial text-[#4A4F5C] max-w-2xl text-base sm:text-lg">
            Every qualifying entry is reviewed through a confidential, criteria-based evaluation conducted by an independent panel of distinguished design professionals.
          </p>
          <div className="pt-1">
            <Link
              href="/jury/portal"
              className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white text-xs font-mono font-semibold uppercase tracking-wider transition-colors shadow-sm"
            >
              <span>Appointed Jury Member Portal</span>
              <ArrowRight size={13} className="text-gold-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* Jury Panel Section */}
      <section className="py-8 sm:py-10 lg:py-12 border-b border-navy-900/10">
        <div className="container-editorial space-y-6 sm:space-y-8">
          <div className="space-y-2.5 max-w-3xl">
            <SectionMarker number="02" label="Evaluation Panel" theme="light" />
            <h2 className="heading-editorial text-navy-900 text-2xl sm:text-3xl lg:text-4xl">
              Meet Our Esteemed Jury
            </h2>
            <p className="body-editorial text-[#4A4F5C] text-sm sm:text-base leading-relaxed">
              The Kutchmitra Home &amp; Decor Awards 2026 panel unites eminent practitioners, heritage conservationists, master interior designers, and academic pioneers. Spanning decades of landmark practice across residential, commercial, and cultural domains, our jury conducts an impartial, criteria-led evaluation to celebrate design excellence, regional craftsmanship, and sustainable innovation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
            {jurors.map((juror) => (
              <PublicJuryCard key={juror.id} profile={juror} />
            ))}
          </div>
        </div>
      </section>

      {/* Suggested Scoring Framework */}
      <section className="py-10 sm:py-14 lg:py-16 bg-[#FBFAF7] border-b border-navy-900/10">
        <div className="container-editorial space-y-12">
          <div className="space-y-3 max-w-2xl">
            <SectionMarker number="03" label="Evaluation Standards" theme="light" />
            <h2 className="heading-editorial text-navy-900">
              Criteria Framework
            </h2>
            <p className="body-editorial text-[#4A4F5C]">
              The official evaluation structure covers five comprehensive dimensions of architectural and interior merit.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PILLARS.map((pillar, idx) => (
              <div
                key={idx}
                className="p-6 bg-white border border-navy-900/10 space-y-3 hover:border-gold-500/40 transition-colors"
              >
                <span className="font-mono text-xs text-gold-600 font-semibold">
                  CRITERION // 0{idx + 1}
                </span>
                <h3 className="font-display text-xl text-navy-900 font-medium">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#4A4F5C] font-sans leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-ivory border border-navy-900/10 text-xs font-mono text-[#4A4F5C]">
            * Note: Final evaluation criteria and weightages will be announced by the organisers before jury evaluation commences.
          </div>
        </div>
      </section>

      {/* Confidentiality & Integrity */}
      <section className="py-10 sm:py-14 lg:py-16 border-b border-navy-900/10">
        <div className="container-editorial">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-4 space-y-3">
              <span className="font-mono text-xs uppercase tracking-widest text-gold-600 font-semibold block">
                Integrity Protocols
              </span>
              <h2 className="heading-editorial text-navy-900 leading-tight">
                Confidential Review Standards
              </h2>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-[#FBFAF7] border border-navy-900/10 space-y-2">
                <div className="flex items-center gap-2 font-display text-lg text-navy-900 font-medium">
                  <EyeOff size={18} className="text-gold-600" />
                  <span>Confidential Scoring</span>
                </div>
                <p className="text-xs text-[#4A4F5C] leading-relaxed">
                  Individual juror scores and comments remain strictly confidential and access-controlled.
                </p>
              </div>

              <div className="p-6 bg-[#FBFAF7] border border-navy-900/10 space-y-2">
                <div className="flex items-center gap-2 font-display text-lg text-navy-900 font-medium">
                  <Scale size={18} className="text-gold-600" />
                  <span>Conflict of Interest</span>
                </div>
                <p className="text-xs text-[#4A4F5C] leading-relaxed">
                  Jurors declare any potential conflict of interest prior to evaluating assigned entries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
