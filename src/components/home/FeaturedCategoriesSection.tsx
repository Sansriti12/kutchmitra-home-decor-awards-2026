import React from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";
import { AWARD_CATEGORIES } from "@/data/categories";

export function FeaturedCategoriesSection() {
  return (
    <section className="bg-ivory py-12 sm:py-16 border-b border-navy-900/10">
      <div className="container-editorial space-y-8 sm:space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <SectionMarker number="02" label="Award Disciplines" theme="light" />
            <h2 className="heading-editorial text-navy-900">
              13 Award Categories
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="body-editorial text-[#4A4F5C] max-w-md text-sm sm:text-base">
              The official disciplines recognized in the 2026 edition, honoring excellence across architecture, interior design, and residential development.
            </p>
            <Button
              href="/categories"
              variant="outline-dark"
              size="sm"
              icon={<ArrowRight size={13} />}
              className="self-start sm:self-auto flex-shrink-0"
            >
              View All Categories
            </Button>
          </div>
        </div>

        {/* 13 Categories Clean Horizontal Presentation */}
        {/* Large desktop: 2 rows of 6 compact editorial cards, with smooth horizontal scroll capability if desired */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5 sm:gap-4">
          {AWARD_CATEGORIES.map((category) => (
            <article
              key={category.id}
              className="group relative bg-[#FBFAF7] border border-navy-900/10 p-5 flex flex-col justify-between transition-all duration-200 hover:border-gold-500/50 hover:shadow-card-hover"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-sand-100 text-gold-600 border border-gold-500/30">
                    {category.number}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Category
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-display text-base text-navy-900 font-medium tracking-tight group-hover:text-gold-600 transition-colors leading-snug">
                    {category.title}
                  </h3>
                  <p className="text-[11px] text-[#4A4F5C] leading-relaxed font-sans line-clamp-3">
                    {category.shortDescription}
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 mt-4 border-t border-navy-900/10 flex items-center justify-between text-xs font-medium">
                <Link
                  href={`/categories/${category.slug}`}
                  className="inline-flex items-center gap-1 text-navy-900 group-hover:text-gold-600 font-mono tracking-wide uppercase text-[11px] font-semibold"
                >
                  <span>View Category</span>
                  <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <Link
                  href="/register"
                  className="text-gold-600 hover:text-gold-700 font-mono uppercase text-[11px] font-semibold"
                >
                  Nominate →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Informational Footer Note */}
        <div className="pt-4 flex items-center justify-between border-t border-navy-900/10 text-xs font-mono text-[#4A4F5C]">
          <span>
            All 13 categories are open for official 2026 nominations upon registration.
          </span>
          <span className="hidden sm:inline-block text-[11px] text-slate-400">
            13 Disciplines &bull; Edition 2026
          </span>
        </div>
      </div>
    </section>
  );
}
