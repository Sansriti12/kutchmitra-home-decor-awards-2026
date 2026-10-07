"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Award,
  ArrowRight,
  MapPin,
  Building,
  User,
  Sparkles,
  Search,
  Filter,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";
import type { PublicWinnerCard } from "@/types/shortlist-winner.types";

interface WinnersShowcaseClientProps {
  initialWinners: PublicWinnerCard[];
  categories: Array<{ id: string; name: string; code: string; slug: string; count: number }>;
}

export default function WinnersShowcaseClient({
  initialWinners,
  categories,
}: WinnersShowcaseClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filteredWinners = initialWinners.filter((w) => {
    if (selectedCategory !== "all" && w.categorySlug !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchProj = w.projectName.toLowerCase().includes(q);
      const matchEntrant = w.entrantName.toLowerCase().includes(q);
      const matchOrg = w.organizationName.toLowerCase().includes(q);
      const matchCat = w.categoryName.toLowerCase().includes(q);
      if (!matchProj && !matchEntrant && !matchOrg && !matchCat) return false;
    }
    return true;
  });

  const totalPublished = initialWinners.length;

  return (
    <main className="flex-1 bg-ivory text-navy-900">
      {/* Editorial Hero Banner */}
      <section className="py-12 sm:py-16 lg:py-20 border-b border-navy-900/10 bg-[#FBFAF7]">
        <div className="container-editorial space-y-6">
          <SectionMarker number="01" label="Honors Archive" theme="light" />
          <div className="max-w-3xl space-y-4">
            <h1 className="heading-display text-navy-900 text-4xl sm:text-5xl lg:text-6xl tracking-tight">
              2026 Winners Showcase
            </h1>
            <p className="body-editorial text-[#4A4F5C] text-lg sm:text-xl leading-relaxed">
              Celebrating distinguished architectural craftsmanship, spatial innovation, and material harmony across Kutch.
            </p>
          </div>

          {totalPublished > 0 && (
            <div className="flex items-center gap-4 text-xs font-mono text-[#4A4F5C] pt-2">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-sand-100 border border-gold-500/30 text-gold-700 font-semibold">
                <Trophy size={13} />
                <span>{totalPublished} Official Honorees Published</span>
              </span>
              <span>Inaugural 2026 Edition</span>
            </div>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      {totalPublished === 0 ? (
        /* Elegant Pre-Event Placeholder when zero winners are published */
        <section className="py-16 sm:py-20 lg:py-24 border-b border-navy-900/10">
          <div className="container-editorial max-w-3xl mx-auto text-center space-y-8">
            <div className="w-16 h-16 mx-auto bg-sand-100 border border-gold-500/30 flex items-center justify-center text-gold-600">
              <Award size={32} />
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-3xl sm:text-4xl text-navy-900 font-medium tracking-tight">
                Awaiting Official Announcement
              </h2>
              <p className="font-sans text-base sm:text-lg text-[#4A4F5C] leading-relaxed max-w-xl mx-auto">
                Winner announcements will be published here following the grand jury evaluation and gala deliberation. Comprehensive project spotlights, citations, and architect profiles will be featured in this dedicated gallery.
              </p>
            </div>

            <div className="p-6 bg-[#FBFAF7] border border-navy-900/10 text-xs font-mono text-[#4A4F5C] max-w-lg mx-auto space-y-2">
              <span className="text-gold-600 font-semibold block uppercase tracking-wider">
                2026 Awards Timeline
              </span>
              <p>
                Qualifying entries proceed through technical verification, qualitative jury scoring, and committee shortlisting prior to final winner proclamation.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Button href="/categories" variant="outline-dark" size="md">
                Explore 13 Categories
              </Button>
              <Button href="/register" variant="primary" size="md" icon={<ArrowRight size={14} />}>
                Nominate Now
              </Button>
            </div>
          </div>
        </section>
      ) : (
        /* Live Winners Showcase Gallery */
        <section className="py-10 sm:py-14 border-b border-navy-900/10">
          <div className="container-editorial space-y-8">
            {/* Filter & Search Bar */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                {/* Search */}
                <div className="relative max-w-md w-full">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search winners by project, architect, or firm..."
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-navy-900/15 text-xs text-navy-900 placeholder-slate-400 focus:outline-none focus:border-gold-500 font-sans shadow-2xs"
                  />
                </div>

                <div className="text-xs font-mono text-[#4A4F5C] flex items-center gap-2">
                  <span>Showing {filteredWinners.length} of {totalPublished} Published Honorees</span>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={cn(
                    "px-4 py-2 text-xs font-mono whitespace-nowrap uppercase tracking-wider transition-all border",
                    selectedCategory === "all"
                      ? "bg-navy-900 text-white font-bold border-navy-900 shadow-sm"
                      : "bg-white text-[#4A4F5C] border-navy-900/10 hover:border-navy-900/30"
                  )}
                >
                  All Categories ({totalPublished})
                </button>

                {categories
                  .filter((c) => c.count > 0)
                  .map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCategory(c.slug)}
                      className={cn(
                        "px-4 py-2 text-xs font-mono whitespace-nowrap uppercase tracking-wider transition-all border flex items-center gap-1.5",
                        selectedCategory === c.slug
                          ? "bg-navy-900 text-white font-bold border-navy-900 shadow-sm"
                          : "bg-white text-[#4A4F5C] border-navy-900/10 hover:border-navy-900/30"
                      )}
                    >
                      <span>Cat {c.code}: {c.name}</span>
                      <span className={cn(
                        "px-1.5 py-0.2 text-[10px] rounded-full",
                        selectedCategory === c.slug ? "bg-gold-500 text-navy-950 font-bold" : "bg-sand-100 text-[#4A4F5C]"
                      )}>
                        {c.count}
                      </span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Winners Cards Grid */}
            {filteredWinners.length === 0 ? (
              <div className="py-16 text-center space-y-2 bg-[#FBFAF7] border border-navy-900/10">
                <Award size={32} className="mx-auto text-slate-400" />
                <h3 className="font-display text-lg text-navy-900">No winners found matching your search</h3>
                <p className="text-xs font-mono text-slate-500">
                  Try adjusting your search criteria or selecting "All Categories".
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredWinners.map((winner) => {
                  const isPrimaryWinner = winner.winnerType === "winner";

                  return (
                    <div
                      key={winner.id}
                      className="bg-white border border-navy-900/10 flex flex-col justify-between group hover:border-gold-500/50 hover:shadow-md transition-all duration-200"
                    >
                      <div>
                        {/* Cover Image / Hero Aspect Box */}
                        <div className="relative h-60 bg-sand-100 overflow-hidden border-b border-navy-900/10">
                          {winner.heroImageUrl ? (
                            <img
                              src={winner.heroImageUrl}
                              alt={winner.projectName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-2 bg-[#FBFAF7]">
                              <Trophy size={36} className="text-gold-500/60" />
                              <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                                Kutchmitra Honoree
                              </span>
                            </div>
                          )}

                          {/* Honor Badge Overlay */}
                          <div className="absolute top-3 left-3">
                            <span
                              className={cn(
                                "px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider shadow-sm",
                                isPrimaryWinner
                                  ? "bg-navy-900 text-gold-400 border border-gold-500/50"
                                  : "bg-white text-navy-900 border border-navy-900/20"
                              )}
                            >
                              ★ {winner.awardTitle}
                            </span>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-6 space-y-3">
                          {/* Category Tag */}
                          <div className="text-[11px] font-mono text-gold-600 font-semibold uppercase tracking-wider">
                            Category {winner.categoryCode} // {winner.categoryName}
                          </div>

                          {/* Project Name */}
                          <h3 className="font-display text-xl sm:text-2xl text-navy-900 font-medium leading-tight group-hover:text-gold-700 transition-colors">
                            {winner.projectName}
                          </h3>

                          {/* Entrant & Organization */}
                          <div className="text-xs text-[#4A4F5C] font-sans space-y-0.5">
                            <div className="font-semibold text-navy-900">{winner.entrantName}</div>
                            {winner.organizationName && (
                              <div className="text-[11px] font-mono text-slate-500">{winner.organizationName}</div>
                            )}
                            {winner.projectLocation && (
                              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 pt-0.5">
                                <MapPin size={11} className="text-gold-500" />
                                <span>{winner.projectLocation}</span>
                              </div>
                            )}
                          </div>

                          {/* Citation Excerpt */}
                          {winner.citation && (
                            <p className="text-xs text-[#4A4F5C] font-sans italic line-clamp-3 leading-relaxed pt-1 border-t border-navy-900/5">
                              "{winner.citation}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Card Footer Link */}
                      <div className="p-6 pt-0">
                        <Link
                          href={`/winners/${winner.id}`}
                          className="w-full inline-flex items-center justify-between px-4 py-2.5 bg-sand-50 hover:bg-navy-900 hover:text-white text-navy-900 text-xs font-mono uppercase font-semibold tracking-wider transition-colors border border-navy-900/10 group-hover:border-gold-500"
                        >
                          <span>Explore Project Showcase</span>
                          <ArrowRight size={13} className="text-gold-500" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
