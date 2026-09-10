import React from "react";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { TIMELINE_MILESTONES } from "@/data/timeline";

export function ImportantDatesSection() {
  return (
    <section className="bg-[#FBFAF7] py-16 sm:py-24 lg:py-28 border-b border-navy-900/10">
      <div className="container-editorial space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <SectionMarker number="05" label="Schedule &amp; Milestones" theme="light" />
            <h2 className="heading-editorial text-navy-900">
              Important Award Dates
            </h2>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-ivory border border-gold-500/30 text-xs font-mono text-gold-600">
            <Clock size={13} />
            <span>Dates To Be Announced by Organizers</span>
          </div>
        </div>

        {/* 6 Milestone Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TIMELINE_MILESTONES.map((milestone) => (
            <div
              key={milestone.number}
              className="p-6 bg-white border border-navy-900/10 space-y-4 relative group hover:border-gold-500/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-sand-100 text-gold-600 border border-gold-500/30">
                  MILESTONE {milestone.number}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-slate-400 bg-sand-100 px-2 py-0.5">
                  <Calendar size={11} className="text-gold-600" />
                  {milestone.date}
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-display text-xl text-navy-900 font-medium tracking-tight">
                  {milestone.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#4A4F5C] font-sans leading-relaxed">
                  {milestone.description}
                </p>
              </div>

              <div className="pt-3 border-t border-navy-900/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>STATUS: PENDING</span>
                <span className="text-gold-600 font-semibold">TBA</span>
              </div>
            </div>
          ))}
        </div>

        {/* Official Note */}
        <div className="p-4 bg-ivory border border-navy-900/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-[#4A4F5C]">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-gold-600 flex-shrink-0" />
            <span>Exact milestone deadlines will be officially announced prior to the nomination opening date.</span>
          </div>
          <span className="text-slate-400">EDITION 2026 ROADMAP</span>
        </div>
      </div>
    </section>
  );
}
