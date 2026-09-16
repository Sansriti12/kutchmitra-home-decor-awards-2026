import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";
import { TIMELINE_MILESTONES } from "@/data/timeline";

interface TimelineStage {
  step: string;
  title: string;
  description: string;
  dateBadge: string;
}

export function JourneyToRecognition() {
  const STAGES: TimelineStage[] = [
    {
      step: "01",
      title: "Nominations",
      description: "Submit your project for consideration in the 2026 edition.",
      dateBadge: TIMELINE_MILESTONES[0]?.date || "TBA",
    },
    {
      step: "02",
      title: "Submission Review",
      description: "Eligible submissions move forward for evaluation.",
      dateBadge: TIMELINE_MILESTONES[2]?.date || "TBA",
    },
    {
      step: "03",
      title: "Jury Evaluation",
      description: "Entries are assessed through the official evaluation methodology.",
      dateBadge: TIMELINE_MILESTONES[3]?.date || "TBA",
    },
    {
      step: "04",
      title: "Shortlisting",
      description: "Shortlisted projects advance to the final stage.",
      dateBadge: TIMELINE_MILESTONES[4]?.date || "TBA",
    },
    {
      step: "05",
      title: "Awards",
      description: "Final winners are announced at the awards stage.",
      dateBadge: TIMELINE_MILESTONES[5]?.date || "TBA",
    },
  ];

  return (
    <section className="bg-[#FBFAF7] py-12 sm:py-16 lg:py-20 border-b border-navy-900/10">
      <div className="container-editorial space-y-10 sm:space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <SectionMarker number="05" label="Award Roadmap" theme="light" />
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-navy-900 font-medium leading-tight tracking-tight">
              Journey to Recognition
            </h2>
            <p className="text-sm sm:text-base text-[#4A4F5C] font-sans leading-relaxed">
              A transparent, 5-stage milestone progression guiding entrants from initial project submission to grand jury evaluation and awards celebration.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gold-500/30 text-xs font-mono text-gold-700 shadow-sm self-start md:self-end">
            <Clock size={13} className="text-gold-600" />
            <span>Schedule: To Be Announced</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP TIMELINE (Horizontal Row with connecting line) */}
        {/* ========================================================================= */}
        <div className="hidden lg:block relative pt-6 pb-2">
          {/* Subtle Horizontal Connecting Axis */}
          <div className="absolute top-[46px] left-[5%] right-[5%] h-[2px] bg-gradient-to-r from-navy-900/10 via-gold-500/40 to-navy-900/10 z-0" />

          <div className="grid grid-cols-5 gap-4 relative z-10">
            {STAGES.map((stage) => (
              <div
                key={stage.step}
                className="flex flex-col items-center text-center space-y-4 group"
              >
                {/* Gold Numbered Marker with Outer Halo */}
                <div className="w-12 h-12 rounded-full bg-white border-2 border-gold-500/50 flex items-center justify-center shadow-sm group-hover:border-gold-600 group-hover:scale-105 transition-all duration-200">
                  <span className="font-mono text-xs font-bold text-navy-900 tracking-wider">
                    {stage.step}
                  </span>
                </div>

                {/* Card Container */}
                <div className="w-full p-4 sm:p-5 bg-white border border-navy-900/10 shadow-sm space-y-2 group-hover:border-gold-500/40 transition-colors flex flex-col justify-between min-h-[160px]">
                  <div className="space-y-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-gold-700 font-semibold block">
                      Stage {stage.step}
                    </span>
                    <h3 className="font-display text-base text-navy-900 font-medium leading-snug">
                      {stage.title}
                    </h3>
                    <p className="text-xs text-[#4A4F5C] font-sans leading-relaxed">
                      {stage.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-navy-900/5 flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-500 font-medium">
                    <Calendar size={11} className="text-gold-600" />
                    <span>{stage.dateBadge}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE / TABLET TIMELINE (Vertical Connecting Line) */}
        {/* ========================================================================= */}
        <div className="lg:hidden relative pl-8 sm:pl-10 space-y-6">
          {/* Vertical Connecting Axis */}
          <div className="absolute left-[15px] sm:left-[19px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-gold-500/40 via-gold-500/25 to-navy-900/10" />

          {STAGES.map((stage) => (
            <div key={stage.step} className="relative space-y-2">
              {/* Vertical Marker Node */}
              <div className="absolute -left-[27px] sm:-left-[31px] top-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border-2 border-gold-500 flex items-center justify-center shadow-sm">
                <span className="font-mono text-[10px] sm:text-xs font-bold text-navy-900">
                  {stage.step}
                </span>
              </div>

              <div className="p-4 sm:p-5 bg-white border border-navy-900/10 shadow-sm space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-gold-700 font-semibold">
                    Stage {stage.step}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500">
                    <Calendar size={11} className="text-gold-600" />
                    <span>{stage.dateBadge}</span>
                  </span>
                </div>
                <h3 className="font-display text-base sm:text-lg text-navy-900 font-medium leading-snug">
                  {stage.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#4A4F5C] font-sans leading-relaxed">
                  {stage.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Action Bar */}
        <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-navy-900/10">
          <span className="text-xs font-mono text-[#4A4F5C]">
            * Official milestone dates will be formally confirmed and published by Kutchmitra.
          </span>
          <Button
            href="/important-dates"
            variant="outline-dark"
            size="md"
            icon={<ArrowRight size={14} />}
            className="self-stretch sm:self-auto"
          >
            View Important Dates
          </Button>
        </div>
      </div>
    </section>
  );
}
