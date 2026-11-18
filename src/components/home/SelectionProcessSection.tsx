import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";

export function SelectionProcessSection() {
  const STEPS = [
    {
      step: "01",
      title: "Online Nomination",
      detail: "Fill in your nomination online.",
    },
    {
      step: "02",
      title: "Category Selection",
      detail:
        "Choose the category that best describes your project. A maximum of 3 category nominations is permitted.",
    },
    {
      step: "03",
      title: "Document Submission",
      detail:
        "Submit the required documents, including the organisation profile, work details, achievements and portfolio.",
    },
    {
      step: "04",
      title: "Jury Evaluation",
      detail: "Submissions will be evaluated by the esteemed Jury members.",
    },
    {
      step: "05",
      title: "Results Announcement",
      detail: "Announcement of the results.",
    },
    {
      step: "06",
      title: "Awards Ceremony & Dinner",
      detail: "The Grand Award Ceremony followed by a Networking Dinner.",
    },
  ];

  return (
    <section id="selection-process" className="bg-white py-14 sm:py-20 lg:py-24 border-b border-navy-900/10">
      <div className="container-editorial space-y-10 sm:space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <SectionMarker number="04" label="Process &amp; Evaluation" theme="light" />
            <h2 className="heading-editorial text-navy-900 leading-tight">
              Selection Process
            </h2>
            <p className="body-editorial text-[#4A4F5C] text-sm sm:text-base">
              A structured six-step progression designed to maintain transparency, ensure rigorous technical screening, and honor outstanding architectural achievements.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start md:self-end">
            <Button href="/register" variant="primary" size="sm" icon={<ArrowRight size={13} />}>
              Start Nomination
            </Button>
          </div>
        </div>

        {/* 6 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {STEPS.map((item, idx) => (
            <div
              key={item.step}
              className="relative p-6 sm:p-7 bg-[#FBFAF7] border border-navy-900/10 hover:border-gold-500/50 hover:shadow-card transition-all duration-200 flex flex-col justify-between group"
            >
              {/* Step Marker Badge */}
              <div className="flex items-center justify-between pb-4 border-b border-navy-900/10">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-gold-700">
                  Step {idx + 1}
                </span>
                <span className="font-mono text-2xl font-light text-navy-900/20 group-hover:text-gold-600 transition-colors">
                  {item.step}
                </span>
              </div>

              {/* Step Content */}
              <div className="pt-4 space-y-2 flex-1">
                <h3 className="font-display text-lg text-navy-900 font-medium">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#4A4F5C] font-sans leading-relaxed">
                  {item.detail}
                </p>
              </div>

              {/* Bottom Subtle Indicator */}
              <div className="pt-4 mt-4 border-t border-navy-900/5 flex items-center gap-1.5 text-[11px] font-mono text-navy-900/60">
                <CheckCircle2 size={13} className="text-gold-600" />
                <span>Phase 0{idx + 1} Verified</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
