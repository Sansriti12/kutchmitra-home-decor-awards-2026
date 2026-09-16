import React from "react";
import { ArrowRight } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";

export function HowToNominatePreview() {
  const STAGES = [
    {
      number: "01",
      title: "Entrant Profile",
      desc: "Verify entrant credentials, architectural studio, designation, and official practice contact details.",
    },
    {
      number: "02",
      title: "Category Selection",
      desc: "Confirm or switch your award discipline among the 12 approved categories with switch protection.",
    },
    {
      number: "03",
      title: "Project Details",
      desc: "Enter project metadata, location, completion date, built-up area in sq. ft., and design scope.",
    },
    {
      number: "04",
      title: "Category Questionnaire",
      desc: "Respond to structured design questions articulating spatial intent, materiality, and innovation.",
    },
    {
      number: "05",
      title: "Media & Documents",
      desc: "Attach high-resolution drawings, floor plans, 3D renderings, and studio portfolio documents.",
    },
    {
      number: "06",
      title: "Complete Preview",
      desc: "Inspect a comprehensive, formatted dossier preview of all answers, drawings, and images prior to submission.",
    },
    {
      number: "07",
      title: "Declaration & Submit",
      desc: "Review legal declarations, lock the nomination dossier, and receive an official Nomination ID and receipt.",
    },
  ];

  return (
    <section className="bg-ivory py-12 sm:py-16 border-b border-navy-900/10">
      <div className="container-editorial space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <SectionMarker number="04" label="The Process" theme="light" />
            <h2 className="heading-editorial text-navy-900">
              How to Nominate
            </h2>
          </div>
          <p className="body-editorial text-[#4A4F5C] max-w-md text-sm sm:text-base">
            Complete the full 7-stage digital nomination journey designed for architects, interior designers, and project studios.
          </p>
        </div>

        {/* 7-Stage Responsive Grid: 7 columns in one horizontal row on large desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-3.5">
          {STAGES.map((stage) => (
            <div
              key={stage.number}
              className="p-4 sm:p-4.5 bg-[#FBFAF7] border border-navy-900/10 space-y-2.5 relative group hover:border-gold-500/40 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xl font-light text-gold-600 block">
                    {stage.number}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest bg-navy-900/5 px-1.5 py-0.5 border border-navy-900/10">
                    STAGE {stage.number}
                  </span>
                </div>
                <h3 className="font-display text-base text-navy-900 font-medium tracking-tight leading-snug">
                  {stage.title}
                </h3>
                <p className="text-[11px] text-[#4A4F5C] font-sans leading-relaxed">
                  {stage.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-navy-900/5 flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500/60" />
                <span>Portal Wizard</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-navy-900/10">
          <span className="text-xs font-mono text-[#4A4F5C]">
            * Drafts can be saved at any stage before final submission.
          </span>
          <Button
            href="/how-to-nominate"
            variant="outline-dark"
            size="md"
            icon={<ArrowRight size={14} />}
          >
            How to Nominate
          </Button>
        </div>
      </div>
    </section>
  );
}
