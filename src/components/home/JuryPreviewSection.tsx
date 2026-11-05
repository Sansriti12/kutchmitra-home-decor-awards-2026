"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { getApprovedJuryProfiles } from "@/lib/data/jury-profiles";

const JUROR_OBJECT_POSITIONS: Record<string, string> = {
  "hasmukh-shah": "center 15%",
  "parul-zaveri": "center 6%",
  "hiren-patel": "center 18%",
  "sarosh-wadia": "center 8%",
};

export function JuryPreviewSection() {
  const jurors = getApprovedJuryProfiles();
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section className="bg-navy-950 text-white py-8 sm:py-10 lg:py-12 relative overflow-hidden border-b border-white/10">
      {/* Background ambient gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(197,160,89,0.06)_0%,_transparent_60%)] pointer-events-none" />

      <div className="container-editorial relative z-10 space-y-6 sm:space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/10">
          <div className="space-y-2 max-w-2xl">
            <SectionMarker number="06" label="Independent Assessment" theme="dark" />
            <h2 className="heading-editorial text-white text-2xl sm:text-3xl lg:text-4xl leading-tight">
              Meet the Esteemed Jury
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed max-w-xl">
              An independent panel of celebrated architects, master interior designers, and academic pioneers evaluating exceptional spatial design across Kutch.
            </p>
          </div>

          <div className="flex-shrink-0">
            <Link
              href="/jury"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-gold"
            >
              <span>Meet the Complete Jury</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* 4-Card Compact Grid: 2 columns mobile/tablet, 4 columns desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
          {jurors.map((juror) => {
            const hasError = failedImages[juror.id];
            return (
              <div
                key={juror.id}
                className="flex flex-col bg-navy-900/90 border border-white/10 hover:border-gold-500/50 transition-all duration-300 group shadow-card overflow-hidden"
              >
                {/* Portrait-oriented image frame ensuring complete face visibility */}
                <div className="relative aspect-[4/4.6] w-full bg-navy-950 overflow-hidden border-b border-white/10 flex-shrink-0">
                  {!hasError ? (
                    <Image
                      src={juror.image}
                      alt={juror.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                      style={{ objectPosition: JUROR_OBJECT_POSITIONS[juror.id] || "center 15%" }}
                      className="object-cover filter grayscale-[10%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                      onError={() => handleImageError(juror.id)}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center">
                      <div className="w-12 h-12 rounded-full bg-navy-800 border border-gold-500/40 flex items-center justify-center text-gold-400 font-display text-lg font-bold mb-1">
                        {juror.name.replace(/^(ID\.|Ar\.)\s*/, "").slice(0, 2)}
                      </div>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400">
                        {juror.city}
                      </span>
                    </div>
                  )}

                  {/* Gradient shadow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent pointer-events-none" />

                  {/* Subtle City Tag */}
                  <div className="absolute bottom-1.5 left-2 z-10">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-200 bg-navy-950/80 px-1.5 py-0.5 border border-white/10">
                      {juror.city}
                    </span>
                  </div>
                </div>

                {/* Profile Information: Compact & Balanced */}
                <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-gold-400 font-mono text-[10px] sm:text-[11px] font-semibold truncate">
                      <Award size={11} className="flex-shrink-0" />
                      <span className="truncate">{juror.designation}</span>
                    </div>

                    <h3 className="font-display text-sm sm:text-base lg:text-lg font-bold text-white leading-snug group-hover:text-gold-300 transition-colors line-clamp-1">
                      {juror.name}
                    </h3>

                    <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-400 line-clamp-1">
                      {juror.organization}
                    </p>
                  </div>

                  {/* Card footer link */}
                  <div className="pt-2 border-t border-white/10">
                    <Link
                      href="/jury"
                      className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-gold-400 hover:text-gold-300 transition-colors group/link"
                    >
                      <span>View Profile</span>
                      <ArrowRight
                        size={11}
                        className="transform group-hover/link:translate-x-1 transition-transform"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner Notice */}
        <div className="p-3 sm:p-3.5 bg-navy-900/60 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <p className="text-xs text-slate-300 font-sans text-center sm:text-left">
            Jury evaluation operates under blind assessment protocols to guarantee absolute impartiality, meritocracy, and candidate confidentiality.
          </p>
          <Link
            href="/jury"
            className="text-[11px] font-mono uppercase tracking-wider text-gold-400 hover:text-gold-300 whitespace-nowrap inline-flex items-center gap-1"
          >
            <span>Integrity Protocols</span>
            <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </section>
  );
}
