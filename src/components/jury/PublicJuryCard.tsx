"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, MapPin, Award } from "lucide-react";
import type { JuryProfile } from "@/lib/data/jury-profiles";

interface PublicJuryCardProps {
  profile: JuryProfile;
}

export function PublicJuryCard({ profile }: PublicJuryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <article className="flex flex-col h-full bg-[#FBFAF7] border border-navy-900/10 hover:border-gold-500/40 transition-colors shadow-card overflow-hidden">
      {/* Top Banner & Photo Area */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start border-b border-navy-900/10 bg-white/60">
        <div className="relative w-24 h-28 sm:w-28 sm:h-32 flex-shrink-0 bg-navy-900 border border-gold-500/30 shadow-sm overflow-hidden">
          {!imgError ? (
            <Image
              src={profile.image}
              alt={profile.name}
              fill
              sizes="(max-width: 640px) 96px, 112px"
              className="object-cover object-top"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gold-400 bg-navy-950 p-2 text-center">
              <span className="font-display text-xl font-bold">
                {profile.name.replace(/^(ID\.|Ar\.)\s*/, "").slice(0, 2)}
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mt-1">
                Jury
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sand-200/80 border border-navy-900/10 text-[10px] font-mono uppercase tracking-wider text-navy-900 font-medium">
              <MapPin size={10} className="text-gold-600" />
              {profile.city}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold-100 border border-gold-500/30 text-[10px] font-mono uppercase tracking-wider text-navy-900 font-medium">
              <Award size={10} className="text-gold-600" />
              Grand Jury
            </span>
          </div>

          <h3 className="font-display text-xl sm:text-2xl font-bold text-navy-900 leading-tight">
            {profile.name}
          </h3>

          <p className="text-xs font-mono text-gold-600 font-semibold">
            {profile.designation}
          </p>

          <p className="text-xs font-mono uppercase tracking-wider text-slate-600 line-clamp-1">
            {profile.organization}
          </p>

          {/* Areas of Experience tags */}
          <div className="pt-1.5">
            <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1 font-semibold">
              Areas of Experience
            </p>
            <div className="flex flex-wrap gap-1">
              {profile.areasOfExperience.map((exp, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 bg-white border border-navy-900/10 text-[10px] font-sans text-navy-900"
                >
                  {exp}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Biography Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2.5 text-xs sm:text-sm text-[#4A4F5C] font-sans leading-relaxed">
          {/* Always display the first paragraph */}
          <p>{profile.fullBio[0]}</p>

          {/* Remaining paragraphs shown when expanded */}
          {isExpanded && (
            <div className="space-y-2.5 pt-1 animate-fadeIn">
              {profile.fullBio.slice(1).map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          )}
        </div>

        {/* Read More / Show Less Toggle Button */}
        {profile.fullBio.length > 1 && (
          <div className="pt-2.5 border-t border-navy-900/10">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-navy-900 hover:text-gold-600 transition-colors focus:outline-none focus:ring-1 focus:ring-gold-500"
            >
              <span>{isExpanded ? "Show Less" : "Read Full Biography"}</span>
              {isExpanded ? (
                <ChevronUp size={13} className="text-gold-600" />
              ) : (
                <ChevronDown size={13} className="text-gold-600" />
              )}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
