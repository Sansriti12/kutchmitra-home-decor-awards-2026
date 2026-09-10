import React from "react";
import { ArrowRight, Clock } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";
import { TIMELINE_MILESTONES } from "@/data/timeline";

export function ImportantDatesPreview() {
  return (
    <section className="bg-[#FBFAF7] py-12 sm:py-16 border-b border-navy-900/10">
      <div className="container-editorial space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <SectionMarker number="05" label="Schedule Preview" theme="light" />
            <h2 className="heading-editorial text-navy-900">
              Important Dates
            </h2>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-ivory border border-gold-500/30 text-xs font-mono text-gold-600">
            <Clock size={13} />
            <span>Dates To Be Announced</span>
          </div>
        </div>

        {/* Compact Horizontal Roadmap Line / Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {TIMELINE_MILESTONES.map((milestone) => (
            <div
              key={milestone.number}
              className="p-4 bg-white border border-navy-900/10 space-y-2 hover:border-gold-500/40 transition-colors"
            >
              <span className="font-mono text-[10px] text-slate-400 block">
                STAGE {milestone.number}
              </span>
              <h3 className="font-display text-base text-navy-900 font-medium leading-tight">
                {milestone.title}
              </h3>
              <div className="pt-1 border-t border-navy-900/5 flex items-center justify-between text-[11px] font-mono text-gold-600 font-semibold">
                <span>DATE</span>
                <span>{milestone.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Link to /important-dates */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-navy-900/10">
          <span className="text-xs font-mono text-[#4A4F5C]">
            Official dates will be released ahead of portal opening.
          </span>
          <Button
            href="/important-dates"
            variant="outline-dark"
            size="md"
            icon={<ArrowRight size={14} />}
          >
            View Important Dates
          </Button>
        </div>
      </div>
    </section>
  );
}
