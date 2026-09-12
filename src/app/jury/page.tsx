import React from "react";
import type { Metadata } from "next";
import { ShieldCheck, UserCheck, Scale, Award, EyeOff } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Jury & Evaluation | Kutchmitra Home & Decor Awards 2026",
  description: "Learn about the independent evaluation process, scoring framework, and jury guidelines for the Kutchmitra Home & Decor Awards 2026.",
};

export default function JuryPage() {
  const PILLARS = [
    {
      title: "Design Excellence",
      desc: "Aesthetic distinction, spatial clarity, design thinking, and structural coherence.",
    },
    {
      title: "Creativity & Innovation",
      desc: "Novel concepts, creative problem-solving, innovative materials, and expressive detailing.",
    },
    {
      title: "Functionality & User Experience",
      desc: "Liveability, intelligent circulation, human comfort, and responsiveness to occupants' lifestyle.",
    },
    {
      title: "Sustainability & Responsibility",
      desc: "Resource efficiency, passive climate response, natural daylighting, and responsible building practices.",
    },
    {
      title: "Overall Impact & Execution Quality",
      desc: "Distinctiveness, finishing craftsmanship, lasting spatial contribution, and flawless execution.",
    },
  ];

  return (
    <main className="flex-1 bg-ivory text-navy-900">
      {/* Banner */}
      <section className="py-10 sm:py-14 lg:py-16 border-b border-navy-900/10 bg-[#FBFAF7]">
        <div className="container-editorial space-y-6">
          <SectionMarker number="01" label="Independent Assessment" theme="light" />
          <h1 className="heading-display text-navy-900 max-w-3xl">
            The Grand Jury &amp; Evaluation Framework
          </h1>
          <p className="body-editorial text-[#4A4F5C] max-w-2xl text-lg">
            Every qualifying entry is reviewed through a confidential, criteria-based evaluation conducted by an independent panel of distinguished design professionals.
          </p>
        </div>
      </section>

      {/* Jury Panel Announcement Section */}
      <section className="py-10 sm:py-14 lg:py-16 border-b border-navy-900/10">
        <div className="container-editorial space-y-8">
          <div className="space-y-3">
            <SectionMarker number="02" label="Evaluation Panel" theme="light" />
            <h2 className="heading-editorial text-navy-900">
              Distinguished Grand Jury
            </h2>
          </div>

          {/* Neutral Panel Announcement Card */}
          <div className="p-8 sm:p-12 bg-[#FBFAF7] border border-navy-900/10 space-y-6 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sand-100 border border-gold-500/30 text-xs font-mono text-gold-600 font-semibold">
              <UserCheck size={14} />
              <span>PANEL ANNOUNCEMENT // EDITION 2026</span>
            </div>

            <div className="space-y-3">
              <h3 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium leading-tight">
                Jury profiles will be announced by the organizing committee.
              </h3>
              <p className="body-editorial text-[#4A4F5C] text-base sm:text-lg leading-relaxed max-w-3xl">
                The 2026 Grand Jury panel will bring together accomplished practitioners, architectural educators, and design authorities to conduct an impartial and rigorous assessment of all qualifying nominations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-navy-900/10 text-xs font-sans">
              <div className="space-y-1">
                <span className="font-mono text-[11px] uppercase tracking-wider text-navy-900 font-semibold block">
                  Independence
                </span>
                <p className="text-[#4A4F5C] leading-relaxed">
                  Evaluations are conducted independently of event organizers or commercial partners.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[11px] uppercase tracking-wider text-navy-900 font-semibold block">
                  Confidentiality
                </span>
                <p className="text-[#4A4F5C] leading-relaxed">
                  Individual scoring and internal commentary remain confidential to protect candidate integrity.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[11px] uppercase tracking-wider text-navy-900 font-semibold block">
                  Meritocracy
                </span>
                <p className="text-[#4A4F5C] leading-relaxed">
                  Entries are judged solely against standardized design criteria and submission evidence.
                </p>
              </div>
            </div>
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
              The initial suggested evaluation structure covers five comprehensive dimensions of architectural and interior merit.
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
