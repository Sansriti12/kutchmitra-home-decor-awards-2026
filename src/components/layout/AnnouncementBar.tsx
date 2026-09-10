import React from "react";
import Link from "next/link";
import { ArrowRight, Award } from "lucide-react";

export function AnnouncementBar() {
  return (
    <aside
      aria-label="Edition Announcement"
      className="relative z-50 bg-navy-950 text-slate-300 border-b border-gold-500/20 py-1.5 px-4 text-xs select-none"
    >
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Edition Badge & Neutral Headline */}
        <div className="flex items-center gap-2.5 truncate">
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-none border border-gold-500/40 bg-gold-500/10 text-gold-400 font-mono text-[10px] uppercase tracking-wider">
            <Award size={11} className="text-gold-400" />
            2026 Edition
          </span>
          <span className="truncate tracking-wide text-slate-300">
            <span className="font-semibold text-white">Kutchmitra Home & Decor Awards 2026</span>
            <span className="hidden md:inline text-slate-400">
              {" "}— Celebrating Design Excellence & Architectural Craftsmanship
            </span>
          </span>
        </div>

        {/* Right: Subtle Action Link */}
        <div className="flex-shrink-0">
          <Link
            href="/about"
            className="group inline-flex items-center gap-1.5 font-medium text-gold-400 hover:text-gold-300 transition-colors duration-200 tracking-wide"
          >
            <span>Explore the Awards</span>
            <ArrowRight
              size={12}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </aside>
  );
}
