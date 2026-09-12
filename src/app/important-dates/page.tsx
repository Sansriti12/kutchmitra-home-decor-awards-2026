import React from "react";
import type { Metadata } from "next";
import { Calendar, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";
import { TIMELINE_MILESTONES } from "@/data/timeline";

export const metadata: Metadata = {
  title: "Important Dates | Kutchmitra Home & Decor Awards 2026",
  description: "Official schedule and milestone timeline for the Kutchmitra Home & Decor Awards 2026 edition.",
};

export default function ImportantDatesPage() {
  return (
    <main className="flex-1 bg-ivory text-navy-900">
      {/* Banner */}
      <section className="py-10 sm:py-14 lg:py-16 border-b border-navy-900/10 bg-[#FBFAF7]">
        <div className="container-editorial space-y-6">
          <SectionMarker number="01" label="Award Timeline" theme="light" />
          <h1 className="heading-display text-navy-900 max-w-3xl">
            Important Dates &amp; Milestones
          </h1>
          <p className="body-editorial text-[#4A4F5C] max-w-2xl text-lg">
            A comprehensive overview of the 6 key milestone stages for the 2026 edition, from portal opening through to the awards ceremony.
          </p>
        </div>
      </section>

      {/* 6 Milestone Timeline Cards */}
      <section className="py-10 sm:py-14 lg:py-16 border-b border-navy-900/10">
        <div className="container-editorial space-y-12">
          <div className="space-y-3 max-w-2xl">
            <SectionMarker number="02" label="Schedule Roadmap" theme="light" />
            <h2 className="heading-editorial text-navy-900">
              The 2026 Award Cycle
            </h2>
            <p className="body-editorial text-[#4A4F5C]">
              All dates are currently provisional and will be confirmed prior to portal opening.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TIMELINE_MILESTONES.map((milestone) => (
              <div
                key={milestone.number}
                className="p-7 bg-[#FBFAF7] border border-navy-900/10 space-y-5 group hover:border-gold-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-sand-100 text-gold-600 border border-gold-500/30">
                    STAGE {milestone.number}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-slate-400 bg-sand-100 px-2.5 py-1">
                    <Calendar size={11} className="text-gold-600" />
                    {milestone.date}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-2xl text-navy-900 font-medium tracking-tight">
                    {milestone.title}
                  </h3>
                  <p className="text-sm text-[#4A4F5C] font-sans leading-relaxed">
                    {milestone.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-navy-900/10 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>STATUS: TO BE ANNOUNCED</span>
                  <span className="text-gold-600 font-semibold">TBD</span>
                </div>
              </div>
            ))}
          </div>

          {/* Official Disclaimer */}
          <div className="p-6 bg-[#FBFAF7] border-l-2 border-gold-500 border-y border-r border-navy-900/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs font-mono text-[#4A4F5C]">
              <AlertCircle size={16} className="text-gold-600 flex-shrink-0" />
              <span>Official milestone dates will be formally announced by the secretariat. All dates remain subject to confirmation.</span>
            </div>
            <Button href="/register" variant="primary" size="sm" icon={<ArrowRight size={13} />}>
              Nominate Now
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
